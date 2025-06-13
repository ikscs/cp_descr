export interface HostDiskUsage {
  id: number;
  host_name: string;
  disk_path: string;
  total_size_gb: number;
  free_space_gb: number;
  collected_at: string;
}

export interface HostContainerStatus {
  id: number;
  host_name: string;
  container_name: string;
  status: 'running' | 'stopped' | 'exited';
  collected_at: string;
}