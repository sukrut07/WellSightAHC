from typing import List, Dict, Any, Optional, Literal, Union
from pydantic import BaseModel, Field

# Base Visual Specification
class BaseVisualSpec(BaseModel):
    title: str = Field(..., description="Short descriptive title of the visualization")
    description: Optional[str] = Field(None, description="Subtitle or operational explanation")
    units: Optional[str] = Field(None, description="Units of measurement (e.g., 'days', 'bbl', 'USD', '°F')")
    date_range: Optional[str] = Field(None, description="Applicable date interval (e.g. '2026-06-01 to 2026-08-31')")
    source_references: List[str] = Field(default_factory=list, description="Referenced record IDs and document citations")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings, caveats, or uncertainties")
    drill_down_id: Optional[str] = Field(None, description="Optional entity ID for drill-down navigation (e.g. well ID)")

# 1. Text Only
class TextVisualSpec(BaseVisualSpec):
    type: Literal["text"] = "text"
    content: str = Field(..., description="Formatted text response")

# 2. Well Status Card
class WellStatusCardSpec(BaseVisualSpec):
    type: Literal["well_status_card"] = "well_status_card"
    well_id: str
    well_name: str
    area: str
    well_type: str
    status: str
    target_formation: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    measured_downtime_days: float = 0.0
    active_conflicts_count: int = 0
    accepted_corrections_count: int = 0

# 3. Metric Cards
class MetricItem(BaseModel):
    label: str
    value: Union[str, float, int]
    subtext: Optional[str] = None
    delta: Optional[str] = None
    status: Optional[str] = None  # 'good', 'warning', 'danger', 'neutral'

class MetricCardsSpec(BaseVisualSpec):
    type: Literal["metric_cards"] = "metric_cards"
    metrics: List[MetricItem]

# 4. Data Table
class TableColumn(BaseModel):
    key: str
    header: str
    alignment: Optional[str] = "left"  # 'left', 'center', 'right'
    format: Optional[str] = None       # 'number', 'currency', 'badge', 'date', 'text'

class DataTableSpec(BaseVisualSpec):
    type: Literal["data_table"] = "data_table"
    columns: List[TableColumn]
    rows: List[Dict[str, Any]]
    total_count: int

# 5. Bar Chart
class BarChartSpec(BaseVisualSpec):
    type: Literal["bar_chart"] = "bar_chart"
    x_axis_key: str
    x_axis_label: str
    y_axis_key: str
    y_axis_label: str
    series_name: Optional[str] = None
    data: List[Dict[str, Any]]

# 6. Line Chart
class LineChartSpec(BaseVisualSpec):
    type: Literal["line_chart"] = "line_chart"
    x_axis_key: str
    x_axis_label: str
    y_axis_keys: List[str]
    y_axis_label: str
    data: List[Dict[str, Any]]

# 7. Heatmap (2D matrix aggregation, e.g. Area vs Month)
class HeatmapCell(BaseModel):
    x: str  # e.g. 'June 2026'
    y: str  # e.g. 'Area A'
    value: float
    annotation: Optional[str] = None

class HeatmapSpec(BaseVisualSpec):
    type: Literal["heatmap"] = "heatmap"
    x_label: str
    y_label: str
    cells: List[HeatmapCell]
    min_value: float = 0.0
    max_value: float = 100.0

# 8. Timeline
class TimelineEvent(BaseModel):
    date: str
    title: str
    description: str
    record_id: Optional[str] = None
    category: str = "operational"  # 'operational', 'inspection', 'repair', 'spill', 'correction'
    status: Optional[str] = None

class TimelineSpec(BaseVisualSpec):
    type: Literal["timeline"] = "timeline"
    events: List[TimelineEvent]

# 9. Location Map
class MapMarker(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    status: str
    area: str
    tooltip: Optional[str] = None

class LocationMapSpec(BaseVisualSpec):
    type: Literal["location_map"] = "location_map"
    markers: List[MapMarker]
    center_lat: float = 31.9686
    center_lng: float = -102.0778
    zoom: int = 9

# 10. Evidence Panel
class CitationSource(BaseModel):
    record_id: str
    source_type: str  # 'inspection', 'repair', 'regulator_event', 'manual', 'sop', 'human_note', 'correction'
    title: str
    excerpt: str
    document_name: Optional[str] = None
    section_title: Optional[str] = None
    timestamp: Optional[str] = None
    url: Optional[str] = None

class EvidencePanelSpec(BaseVisualSpec):
    type: Literal["evidence_panel"] = "evidence_panel"
    citations: List[CitationSource]

# 11. Conflict Panel
class ConflictNotice(BaseModel):
    target_id: str
    issue: str
    primary_source: str
    competing_source: str
    competing_values: Dict[str, Any]
    uncertainty_explanation: str
    precedence_rule: Optional[str] = None
    status: str = "Unresolved"  # 'Unresolved', 'Accepted Override', 'Investigating'

class ConflictPanelSpec(BaseVisualSpec):
    type: Literal["conflict_panel"] = "conflict_panel"
    conflicts: List[ConflictNotice]

# 12. Clarification Request
class ClarificationOption(BaseModel):
    label: str
    suggested_query: str

class ClarificationRequestSpec(BaseVisualSpec):
    type: Literal["clarification_request"] = "clarification_request"
    question: str
    options: List[ClarificationOption]

# Discriminated Union for all Generative UI Visual Specifications
VisualSpecUnion = Union[
    TextVisualSpec,
    WellStatusCardSpec,
    MetricCardsSpec,
    DataTableSpec,
    BarChartSpec,
    LineChartSpec,
    HeatmapSpec,
    TimelineSpec,
    LocationMapSpec,
    EvidencePanelSpec,
    ConflictPanelSpec,
    ClarificationRequestSpec,
]

class VisualizationSpec(BaseModel):
    spec: VisualSpecUnion = Field(..., discriminator="type")
