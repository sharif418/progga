from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import io
import os
import pingouin as pg
import scipy.stats as stats

app = FastAPI(title="Progga Paromanobik Stats API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local app, allowing all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def read_data(file: UploadFile) -> pd.DataFrame:
    try:
        content = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise ValueError("অসমর্থিত ফাইল ফরম্যাট। অনুগ্রহ করে .csv বা .xlsx আপলোড করুন।")
        
        # Clean up column names by stripping whitespace
        df.columns = df.columns.astype(str).str.strip()
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ফাইল পড়ার সময় ত্রুটি: {str(e)}")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend engine is running"}


@app.post("/analyze/extract-columns")
async def extract_columns(file: UploadFile = File(...)):
    """Extracts column headers for mapping"""
    df = read_data(file)
    columns = list(df.columns)
    return {"columns": columns}


def generate_interpretation(p_value: float, test_type: str, f_value: float = None) -> str:
    significance = "পরিসংখ্যানগতভাবে উল্লেখযোগ্য (Statistically Significant)" if p_value < 0.05 else "পরিসংখ্যানগতভাবে উল্লেখযোগ্য নয় (Not Statistically Significant)"
    hypothesis = "নাল হাইপোথিসিস বাতিল করা যায় (Reject the null hypothesis)" if p_value < 0.05 else "নাল হাইপোথিসিস বাতিল করা যায় না (Fail to reject the null hypothesis)"
    
    if test_type == "oneway":
        effect_text = "উল্লেখযোগ্য প্রভাব রয়েছে" if p_value < 0.05 else "কোনো উল্লেখযোগ্য প্রভাব নেই"
        return f"One-Way ANOVA ব্যবহার করে দেখা হয়েছে যে ইন্ডিপেন্ডেন্ট ভ্যারিয়েবলটি ডিপেন্ডেন্ট ভ্যারিয়েবলের উপর কোনো প্রভাব ফেলে কিনা। এই ক্ষেত্রে গ্রুপগুলোর মধ্যে পার্থক্য {significance} (F = {f_value:.3f}, p = {p_value:.4f})। সুতরাং, আমরা বলতে পারি যে {hypothesis} এবং গ্রুপিং ফ্যাক্টরের {effect_text}।"
    elif test_type == "twoway":
        return f"Two-Way ANOVA ক্যালকুলেট করা হয়েছে। ইন্টারঅ্যাকশন ইফেক্টের জন্য p-value হলো {p_value:.4f}। সুতরাং, দুটি ইন্ডিপেন্ডেন্ট ভ্যারিয়েবলের মধ্যে {significance} ইন্টারঅ্যাকশন রয়েছে।"
    return ""


@app.post("/analyze/anova-oneway")
async def anova_oneway(
    file: UploadFile = File(...),
    dependent: str = Form(...),
    factor: str = Form(...)
):
    try:
        df = read_data(file)
        
        if dependent not in df.columns or factor not in df.columns:
            raise ValueError("নির্বাচিত ভ্যারিয়েবলগুলো ডেটাসেটে পাওয়া যায়নি।")
            
        # Drop missing values
        df_clean = df[[dependent, factor]].dropna()
        
        # Calculate ANOVA using Pingouin
        aov = pg.anova(data=df_clean, dv=dependent, between=factor, detailed=True)
        
        # Extract F and p values from the first row (the factor row)
        f_val = float(aov['F'].iloc[0])
        p_val = float(aov['p_unc'].iloc[0])
        ss = float(aov['SS'].iloc[0])
        df1 = int(aov['DF'].iloc[0])
        
        interpretation = generate_interpretation(p_val, "oneway", f_val)
        
        # Calculate group means for visualization
        group_means = df_clean.groupby(factor)[dependent].mean().reset_index()
        group_means[factor] = group_means[factor].astype(str)
        chart_data = group_means.rename(columns={factor: 'name', dependent: 'value'}).to_dict(orient='records')
        
        return {
            "status": "success",
            "f_value": f_val,
            "p_value": p_val,
            "interpretation": interpretation,
            "table_data": {
                "source": factor,
                "ss": ss,
                "df": df1
            },
            "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

@app.post("/analyze/anova-twoway")
async def anova_twoway(
    file: UploadFile = File(...),
    dependent: str = Form(...),
    factor: str = Form(...),
    factor2: str = Form(...)
):
    try:
        df = read_data(file)
        
        # Clean data
        df_clean = df[[dependent, factor, factor2]].dropna()
        
        # Two-Way ANOVA via Pingouin
        aov = pg.anova(data=df_clean, dv=dependent, between=[factor, factor2], detailed=True)
        
        # Assuming table is [factor, factor2, factor*factor2, Residual]
        # We find the interaction row
        interaction_row = aov[aov['Source'] == f'{factor} * {factor2}']
        if interaction_row.empty:
            # Fallback
            interaction_row = aov.iloc[2]
            
        f_val = float(interaction_row['F'].iloc[0]) if not pd.isna(interaction_row['F'].iloc[0]) else 0
        p_val = float(interaction_row['p_unc'].iloc[0]) if not pd.isna(interaction_row['p_unc'].iloc[0]) else 1
        
        interpretation = generate_interpretation(p_val, "twoway", f_val)
        
        # Calculate group means for visualization (based on primary factor for simplicity)
        group_means = df_clean.groupby(factor)[dependent].mean().reset_index()
        group_means[factor] = group_means[factor].astype(str)
        chart_data = group_means.rename(columns={factor: 'name', dependent: 'value'}).to_dict(orient='records')
        
        return {
             "status": "success",
             "f_value": f_val,
             "p_value": p_val,
             "interpretation": interpretation,
             "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/descriptive")
async def descriptive_stats(
    file: UploadFile = File(...),
    dependent: str = Form(...),
    factor: str = Form(None)
):
    """Descriptive Statistics: Mean, Median, Std Dev, Min, Max, Count"""
    try:
        df = read_data(file)
        df_clean = df.dropna(subset=[dependent])
        
        # Check if dependent is numeric
        if not pd.api.types.is_numeric_dtype(df_clean[dependent]):
            raise ValueError("ডিপেন্ডেন্ট ভ্যারিয়েবল অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে।")
        
        if factor and factor in df.columns:
            # Group-wise descriptive stats
            grouped = df_clean.groupby(factor)[dependent].agg(['count', 'mean', 'median', 'std', 'min', 'max']).reset_index()
            grouped.columns = ['গ্রুপ', 'পর্যবেক্ষণ সংখ্যা (N)', 'গড় (Mean)', 'মধ্যমা (Median)', 'আদর্শ বিচ্যুতি (Std Dev)', 'সর্বনিম্ন (Min)', 'সর্বোচ্চ (Max)']
            
            table_data = []
            for _, row in grouped.iterrows():
                table_data.append({
                    "group": str(row['গ্রুপ']),
                    "count": int(row['পর্যবেক্ষণ সংখ্যা (N)']),
                    "mean": round(float(row['গড় (Mean)']), 4),
                    "median": round(float(row['মধ্যমা (Median)']), 4),
                    "std": round(float(row['আদর্শ বিচ্যুতি (Std Dev)']), 4) if pd.notna(row['আদর্শ বিচ্যুতি (Std Dev)']) else 0,
                    "min": round(float(row['সর্বনিম্ন (Min)']), 4),
                    "max": round(float(row['সর্বোচ্চ (Max)']), 4)
                })
            
            chart_data = [{"name": str(r['গ্রুপ']), "value": round(float(r['গড় (Mean)']), 2)} for _, r in grouped.iterrows()]
            
            interpretation = f"ডেটাসেটের '{dependent}' ভ্যারিয়েবলটিকে '{factor}' অনুসারে গ্রুপভিত্তিক বিশ্লেষণ করা হয়েছে। মোট {len(grouped)} টি গ্রুপ পাওয়া গেছে। সর্বোচ্চ গড় মান {grouped['গড় (Mean)'].max():.4f} এবং সর্বনিম্ন গড় মান {grouped['গড় (Mean)'].min():.4f}।"
        else:
            # Overall descriptive stats
            desc = df_clean[dependent].describe()
            table_data = [{
                "group": "সম্পূর্ণ ডেটা",
                "count": int(desc['count']),
                "mean": round(float(desc['mean']), 4),
                "median": round(float(df_clean[dependent].median()), 4),
                "std": round(float(desc['std']), 4),
                "min": round(float(desc['min']), 4),
                "max": round(float(desc['max']), 4)
            }]
            chart_data = [{"name": "সম্পূর্ণ ডেটা", "value": round(float(desc['mean']), 2)}]
            interpretation = f"ডেটাসেটের '{dependent}' ভ্যারিয়েবলের বর্ণনামূলক পরিসংখ্যান: মোট পর্যবেক্ষণ = {int(desc['count'])}, গড় (Mean) = {desc['mean']:.4f}, আদর্শ বিচ্যুতি (Std Dev) = {desc['std']:.4f}, সর্বনিম্ন = {desc['min']:.4f}, সর্বোচ্চ = {desc['max']:.4f}।"
        
        return {
            "status": "success",
            "table_data": table_data,
            "chart_data": chart_data,
            "interpretation": interpretation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/tukey")
async def tukey_test(
    file: UploadFile = File(...),
    dependent: str = Form(...),
    factor: str = Form(...)
):
    """Tukey HSD Post-Hoc Test"""
    try:
        df = read_data(file)
        df_clean = df[[dependent, factor]].dropna()
        
        if not pd.api.types.is_numeric_dtype(df_clean[dependent]):
            raise ValueError("ডিপেন্ডেন্ট ভ্যারিয়েবল অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে।")
        
        # Run Tukey HSD using Pingouin
        tukey = pg.pairwise_tukey(data=df_clean, dv=dependent, between=factor)
        
        # Build results table
        comparisons = []
        sig_pairs = []
        for _, row in tukey.iterrows():
            is_sig = row['p-tukey'] < 0.05
            comparisons.append({
                "group_a": str(row['A']),
                "group_b": str(row['B']),
                "mean_diff": round(float(row['diff']), 4),
                "p_value": round(float(row['p-tukey']), 4),
                "significant": is_sig
            })
            if is_sig:
                sig_pairs.append(f"{row['A']} ↔ {row['B']}")
        
        if sig_pairs:
            interpretation = f"Tukey HSD Post-Hoc টেস্ট অনুযায়ী, নিম্নলিখিত গ্রুপগুলোর মধ্যে পরিসংখ্যানগতভাবে উল্লেখযোগ্য পার্থক্য পাওয়া গেছে: {', '.join(sig_pairs)}। এর মানে হলো এই গ্রুপগুলোর গড় মান একে অপরের থেকে তাৎপর্যপূর্ণভাবে ভিন্ন।"
        else:
            interpretation = "Tukey HSD Post-Hoc টেস্ট অনুযায়ী, কোনো গ্রুপের মধ্যে পরিসংখ্যানগতভাবে উল্লেখযোগ্য পার্থক্য পাওয়া যায়নি (সকল p > 0.05)।"
        
        # Chart data: group means
        group_means = df_clean.groupby(factor)[dependent].mean().reset_index()
        chart_data = [{"name": str(r[factor]), "value": round(float(r[dependent]), 2)} for _, r in group_means.iterrows()]
        
        return {
            "status": "success",
            "comparisons": comparisons,
            "chart_data": chart_data,
            "interpretation": interpretation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/dmrt")
async def dmrt_test(
    file: UploadFile = File(...),
    dependent: str = Form(...),
    factor: str = Form(...)
):
    """Duncan Multiple Range Test (DMRT)"""
    try:
        import numpy as np
        from scipy.stats import studentized_range
        
        df = read_data(file)
        df_clean = df[[dependent, factor]].dropna()
        
        if not pd.api.types.is_numeric_dtype(df_clean[dependent]):
            raise ValueError("ডিপেন্ডেন্ট ভ্যারিয়েবল অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে।")
        
        groups = df_clean.groupby(factor)[dependent]
        group_names = list(groups.groups.keys())
        group_means = groups.mean().sort_values(ascending=False)
        group_counts = groups.count()
        
        # Calculate MSE (within-group variance)
        overall_mean = df_clean[dependent].mean()
        n_total = len(df_clean)
        n_groups = len(group_names)
        
        ss_within = sum(((groups.get_group(g) - groups.get_group(g).mean())**2).sum() for g in group_names)
        df_within = n_total - n_groups
        mse = ss_within / df_within if df_within > 0 else 0
        
        # Pairwise comparisons using Duncan's approach
        sorted_groups = group_means.index.tolist()
        comparisons = []
        sig_groups = set()
        
        for i in range(len(sorted_groups)):
            for j in range(i + 1, len(sorted_groups)):
                g1, g2 = sorted_groups[i], sorted_groups[j]
                mean_diff = abs(float(group_means[g1]) - float(group_means[g2]))
                n1, n2 = int(group_counts[g1]), int(group_counts[g2])
                se = np.sqrt(mse * (1/n1 + 1/n2) / 2)
                
                if se > 0:
                    q_stat = mean_diff / se
                    p_range = j - i + 1
                    try:
                        p_val = 1 - studentized_range.cdf(q_stat, p_range, df_within)
                    except:
                        p_val = 0.05 if q_stat > 2.5 else 0.5
                else:
                    p_val = 1.0
                
                is_sig = p_val < 0.05
                comparisons.append({
                    "group_a": str(g1),
                    "group_b": str(g2),
                    "mean_a": round(float(group_means[g1]), 4),
                    "mean_b": round(float(group_means[g2]), 4),
                    "mean_diff": round(mean_diff, 4),
                    "significant": is_sig
                })
                if is_sig:
                    sig_groups.add(str(g1))
                    sig_groups.add(str(g2))
        
        # Build grouping letters
        letters = {}
        current_letter = 'a'
        for g in sorted_groups:
            letters[str(g)] = current_letter
            if str(g) in sig_groups:
                current_letter = chr(ord(current_letter) + 1)
        
        ranking = [{"group": str(g), "mean": round(float(group_means[g]), 4), "letter": letters.get(str(g), 'a')} for g in sorted_groups]
        
        interpretation = f"Duncan Multiple Range Test (DMRT) অনুসারে গ্রুপগুলোকে তাদের গড় মানের ভিত্তিতে র‍্যাঙ্ক করা হয়েছে। একই অক্ষরবিশিষ্ট গ্রুপগুলোর মধ্যে কোনো উল্লেখযোগ্য পার্থক্য নেই। ভিন্ন অক্ষর মানে তাৎপর্যপূর্ণ পার্থক্য রয়েছে (p < 0.05)।"
        
        chart_data = [{"name": str(g), "value": round(float(group_means[g]), 2)} for g in sorted_groups]
        
        return {
            "status": "success",
            "ranking": ranking,
            "comparisons": comparisons,
            "chart_data": chart_data,
            "interpretation": interpretation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/cluster")
async def cluster_analysis(
    file: UploadFile = File(...),
    variables: str = Form(...),
    n_clusters: int = Form(3)
):
    """K-Means Cluster Analysis"""
    try:
        import numpy as np
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler
        
        df = read_data(file)
        
        # Parse variable list
        var_list = [v.strip() for v in variables.split(',')]
        
        for v in var_list:
            if v not in df.columns:
                raise ValueError(f"ভ্যারিয়েবল '{v}' ডেটাসেটে পাওয়া যায়নি।")
            if not pd.api.types.is_numeric_dtype(df[v]):
                raise ValueError(f"ভ্যারিয়েবল '{v}' সংখ্যাসূচক (Numeric) নয়।")
        
        df_clean = df[var_list].dropna()
        
        if len(df_clean) < n_clusters:
            raise ValueError(f"ক্লাস্টার সংখ্যা ({n_clusters}) পর্যবেক্ষণ সংখ্যার ({len(df_clean)}) চেয়ে বেশি হতে পারে না।")
        
        # Standardize
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(df_clean)
        
        # K-Means
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        
        df_clean = df_clean.copy()
        df_clean['cluster'] = labels
        
        # Cluster summaries
        cluster_summary = []
        for c in range(n_clusters):
            cluster_data = df_clean[df_clean['cluster'] == c]
            summary = {"cluster": f"ক্লাস্টার {c + 1}", "count": int(len(cluster_data))}
            for v in var_list:
                summary[f"{v}_mean"] = round(float(cluster_data[v].mean()), 4)
            cluster_summary.append(summary)
        
        # Chart data: cluster sizes
        chart_data = [{"name": f"ক্লাস্টার {c + 1}", "value": int((labels == c).sum())} for c in range(n_clusters)]
        
        interpretation = f"K-Means Cluster Analysis ব্যবহার করে {len(df_clean)} টি পর্যবেক্ষণকে {n_clusters} টি ক্লাস্টারে ভাগ করা হয়েছে। "
        for s in cluster_summary:
            interpretation += f"{s['cluster']}-এ {s['count']} টি পর্যবেক্ষণ রয়েছে। "
        
        return {
            "status": "success",
            "cluster_summary": cluster_summary,
            "chart_data": chart_data,
            "interpretation": interpretation,
            "variables": var_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Serve frontend static files in production
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes"""
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
