from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.generative_ui import VisualSpecUnion, CitationSource, ConflictNotice

class ChatRequest(BaseModel):
    message: str = Field(..., description="Natural language prompt from operator")
    conversation_id: Optional[str] = Field(None, description="Active conversation thread ID")
    user_id: str = Field(default="demo_user_alpha", description="User ID for private memory isolation")
    override_visual_type: Optional[str] = Field(None, description="Explicit visual preference e.g. 'table', 'bar_chart', 'heatmap'")

class ToolExecutionTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result_summary: str
    execution_time_ms: float
    status: str = "success"  # success, warning, error

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    visualization: Optional[VisualSpecUnion] = None
    sources: List[CitationSource] = Field(default_factory=list)
    conflicts: List[ConflictNotice] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    tool_traces: List[ToolExecutionTrace] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
