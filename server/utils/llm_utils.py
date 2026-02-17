"""
Centralized LLM utility using LangChain with OpenAI
Provides a single LLM instance that can be used across all services
"""
import os
import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LLMConfig:
    """Configuration for LLM"""
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL_NAME", "gpt-4o")
    DEFAULT_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    DEFAULT_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "150"))

def get_llm(
    temperature: Optional[float] = None,
    timeout: Optional[int] = None,
    model: Optional[str] = None
) -> ChatOpenAI:
    """
    Get a configured LLM instance using OpenAI
    
    Args:
        temperature: Temperature for the LLM (default: from config)
        timeout: Timeout in seconds (default: from config)
        model: Model name (default: from config)
        
    Returns:
        Configured ChatOpenAI instance
    """
    if not LLMConfig.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set in environment variables")
    
    llm = ChatOpenAI(
        api_key=LLMConfig.OPENAI_API_KEY,
        model=model or LLMConfig.OPENAI_MODEL or "gpt-4o",
        temperature=temperature if temperature is not None else LLMConfig.DEFAULT_TEMPERATURE,
        timeout=timeout if timeout is not None else LLMConfig.DEFAULT_TIMEOUT,
    )
    
    logger.info(f"Initialized LLM with model: {model or LLMConfig.OPENAI_MODEL or 'gpt-4o'}, temperature: {temperature if temperature is not None else LLMConfig.DEFAULT_TEMPERATURE}")
    
    return llm