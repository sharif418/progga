
import pandas as pd
df = pd.DataFrame({'yield': [20, 22, 19, 21, 23, 18, 25, 24, 26],
                   'fertilizer': ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C']})
df.to_csv('test_data.csv', index=False)
