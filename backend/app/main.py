import sys
from pathlib import Path

# Ensure root (which contains the 'backend' package) is in sys.path
# so that both `from backend.main import app` and relative imports work seamlessly
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.main import app
