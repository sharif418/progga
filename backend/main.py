from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
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
