# Python helper utility
def helper_function(data):
    """A helper function that processes data."""
    return [x * 2 for x in data if x > 0]

def another_function():
    return "Hello from Python"

if __name__ == "__main__":
    print(helper_function([1, 2, 3, 4, 5]))
EOF