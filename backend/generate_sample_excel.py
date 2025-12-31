import pandas as pd
import os

data = {
    "student_id": ["SV001", "SV002", "SV003"],
    "citizen_id": ["001099123456", "001099654321", "123456789"]
}

df = pd.DataFrame(data)

# Save to current directory
file_path = "sample_students.xlsx"
df.to_excel(file_path, index=False)

print(f"File created at: {os.path.abspath(file_path)}")
print("Data preview:")
print(df)
