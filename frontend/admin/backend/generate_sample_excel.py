import pandas as pd

def generate_excel():
    data = {
        "student_id": ["SV001", "SV002", "SV003"],
        "citizen_id": ["001099123456", "079099000001", "079099000002"]
        # Add other columns if the service expands later
    }
    
    df = pd.DataFrame(data)
    # Ensure all are strings to simulate typical excel issues (though pandas handles writes well)
    df = df.astype(str)
    
    output_path = "students_sample.xlsx"
    df.to_excel(output_path, index=False)
    print(f"Generated {output_path}")

if __name__ == "__main__":
    generate_excel()
