import time
from typing import List, Dict

class ReasoningTrace:
    def __init__(self):
        self.steps: List[Dict] = []
        self.start_time = time.time()
        
    def log_step(self, tool_name: str, input_params: dict, output_summary: str):
        now = time.time()
        if self.steps:
            last_timestamp = self.steps[-1]["timestamp"]
            duration_ms = round(((now - self.start_time) - last_timestamp) * 1000, 2)
        else:
            duration_ms = round((now - self.start_time) * 1000, 2)
            
        self.steps.append({
            "tool": tool_name,
            "input": input_params,
            "output": output_summary,
            "timestamp": round(now - self.start_time, 2),
            "duration_ms": duration_ms
        })
        
    def finalize(self) -> List[Dict]:
        return self.steps
