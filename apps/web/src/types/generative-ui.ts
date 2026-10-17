// TypeScript Discriminated Union matching Backend Pydantic Schemas

export interface BaseVisualSpec {
  title: string;
  description?: string;
  units?: string;
  date_range?: string;
  source_references?: string[];
  warnings?: string[];
  drill_down_id?: string;
}

export interface TextVisualSpec extends BaseVisualSpec {
  type: 'text';
  content: string;
}

export interface WellStatusCardSpec extends BaseVisualSpec {
  type: 'well_status_card';
  well_id: string;
  well_name: string;
  area: string;
  well_type: string;
  status: string;
  target_formation: string;
  latitude?: number;
  longitude?: number;
  measured_downtime_days: number;
  active_conflicts_count: number;
  accepted_corrections_count: number;
}

export interface MetricItem {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: string;
  status?: 'good' | 'warning' | 'danger' | 'neutral';
}

export interface MetricCardsSpec extends BaseVisualSpec {
  type: 'metric_cards';
  metrics: MetricItem[];
}

export interface TableColumn {
  key: string;
  header: string;
  alignment?: 'left' | 'center' | 'right';
  format?: 'number' | 'currency' | 'badge' | 'date' | 'text';
}

export interface DataTableSpec extends BaseVisualSpec {
  type: 'data_table';
  columns: TableColumn[];
  rows: Record<string, any>[];
  total_count: number;
}

export interface BarChartSpec extends BaseVisualSpec {
  type: 'bar_chart';
  x_axis_key: string;
  x_axis_label: string;
  y_axis_key: string;
  y_axis_label: string;
  series_name?: string;
  data: Record<string, any>[];
}

export interface LineChartSpec extends BaseVisualSpec {
  type: 'line_chart';
  x_axis_key: string;
  x_axis_label: string;
  y_axis_keys: string[];
  y_axis_label: string;
  data: Record<string, any>[];
}

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  annotation?: string;
}

export interface HeatmapSpec extends BaseVisualSpec {
  type: 'heatmap';
  x_label: string;
  y_label: string;
  cells: HeatmapCell[];
  min_value?: number;
  max_value?: number;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  record_id?: string;
  category?: 'operational' | 'inspection' | 'repair' | 'spill' | 'correction';
  status?: string;
}

export interface TimelineSpec extends BaseVisualSpec {
  type: 'timeline';
  events: TimelineEvent[];
}

export interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  area: string;
  tooltip?: string;
}

export interface LocationMapSpec extends BaseVisualSpec {
  type: 'location_map';
  markers: MapMarker[];
  center_lat?: number;
  center_lng?: number;
  zoom?: number;
}

export interface CitationSource {
  record_id: string;
  source_type: 'inspection' | 'repair' | 'regulator_event' | 'manual' | 'sop' | 'human_note' | 'correction';
  title: string;
  excerpt: string;
  document_name?: string;
  section_title?: string;
  timestamp?: string;
  url?: string;
}

export interface EvidencePanelSpec extends BaseVisualSpec {
  type: 'evidence_panel';
  citations: CitationSource[];
}

export interface ConflictNotice {
  target_id: string;
  issue: string;
  primary_source: string;
  competing_source: string;
  competing_values: Record<string, any>;
  uncertainty_explanation: string;
  precedence_rule?: string;
  status: 'Unresolved' | 'Accepted Override' | 'Investigating';
}

export interface ConflictPanelSpec extends BaseVisualSpec {
  type: 'conflict_panel';
  conflicts: ConflictNotice[];
}

export interface ClarificationOption {
  label: string;
  suggested_query: string;
}

export interface ClarificationRequestSpec extends BaseVisualSpec {
  type: 'clarification_request';
  question: string;
  options: ClarificationOption[];
}

export type VisualSpecUnion =
  | TextVisualSpec
  | WellStatusCardSpec
  | MetricCardsSpec
  | DataTableSpec
  | BarChartSpec
  | LineChartSpec
  | HeatmapSpec
  | TimelineSpec
  | LocationMapSpec
  | EvidencePanelSpec
  | ConflictPanelSpec
  | ClarificationRequestSpec;

export interface VisualizationWrapper {
  spec: VisualSpecUnion;
}

// Chat API Message payload
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: any[];
  visualization?: VisualSpecUnion;
  sources?: CitationSource[];
  conflicts?: ConflictNotice[];
  warnings?: string[];
  created_at: string;
}
