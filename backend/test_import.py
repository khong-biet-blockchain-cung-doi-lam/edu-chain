import sys
print("Python executable:", sys.executable)
print("\nPython path:")
for path in sys.path:
    print(f"  {path}")
print("\nTrying to import Flask...")
try:
    import flask
    print("✅ Flask imported successfully!")
    print(f"Flask location: {flask.__file__}")
except ImportError as e:
    print(f"❌ Import error: {e}")
