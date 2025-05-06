
import logging
import time
import functools
from typing import Dict, Any

# Performance metrics dictionary to store timing information
performance_metrics: Dict[str, float] = {}

# Create a custom logger formatter that includes timing information
class TimingLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        if 'elapsed' not in kwargs.get('extra', {}):
            kwargs.setdefault('extra', {})['elapsed'] = 0
        return msg, kwargs

logger = TimingLoggerAdapter(logging.getLogger("api"), {})

# Configure standard logging
def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s - %(funcName)s:%(lineno)d',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    return logger

# Timing context manager for easy timing measurement
class TimingContext:
    def __init__(self, name, log_level=logging.INFO):
        self.name = name
        self.log_level = log_level
        self.start_time = None
        
    def __enter__(self):
        self.start_time = time.time()
        logger.log(self.log_level, f"Starting {self.name}", extra={"elapsed": 0})
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        performance_metrics[self.name] = elapsed
        logger.log(self.log_level, f"Completed {self.name}", extra={"elapsed": elapsed})
        if exc_type:
            logger.error(f"Error in {self.name}: {exc_val}", extra={"elapsed": elapsed})

# Decorator for timing functions
def log_timing(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        name = func.__name__
        start_time = time.time()
        logger.info(f"Starting {name}", extra={"elapsed": 0})
        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start_time
            performance_metrics[name] = elapsed
            logger.info(f"Completed {name}", extra={"elapsed": elapsed})
            return result
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(f"Error in {name}: {str(e)}", extra={"elapsed": elapsed})
            raise
    return wrapper
