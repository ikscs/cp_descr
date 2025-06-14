// import { fi } from 'date-fns/locale';
import { HostDiskUsage, HostContainerStatus } from './types';
import { fetchData, IFetchResponse } from '../../api/data/fetchData';

export const fetchHostDiskUsage = async (): Promise<HostDiskUsage[]> => {
    try {
        const params = {
            from: 'pcnt.host_disk_usage',
            order: 'host_name, disk_path',
        };

        const response: IFetchResponse = (await fetchData(params));
        console.log('[fetchHostDiskUsage] response:', response);
        return response;

    } catch (err) {
        console.error('[fetchHostDiskUsage] Error fetching HostDiskUsage:', err);
        return [];
    }  
}


export const fetchHostDiskUsage_mock = (): Promise<HostDiskUsage[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          host_name: 'server-01',
          disk_path: '/dev/sda1',
          total_size_gb: 500.00,
          // free_space_gb: 150.75,
          used_space_gb: 150.75,
          collected_at: '2025-06-12T10:00:00Z',
        },
        {
          id: 2,
          host_name: 'server-01',
          disk_path: '/dev/sdb1',
          total_size_gb: 1000.00,
          // free_space_gb: 750.20,
          used_space_gb: 750.20,
          collected_at: '2025-06-12T10:00:00Z',
        },
        {
          id: 3,
          host_name: 'server-02',
          disk_path: '/dev/nvme0n1p1',
          total_size_gb: 256.00,
          // free_space_gb: 80.50,
          used_space_gb: 80.50,
          collected_at: '2025-06-12T10:05:00Z',
        },
      ]);
    }, 500); // Simulate network delay
  });
};

export const fetchHostContainerStatus = async (): Promise<HostContainerStatus[]> => {
    try {
        const params = {
            from: 'pcnt.host_container_status',
            order: 'host_name, container_name',
        };

        const response: IFetchResponse = (await fetchData(params));
        console.log('[fetchHostContainerStatus] response:', response);
        return response;

    } catch (err) {
        console.error('[fetchHostContainerStatus] Error fetching ContainerStatus:', err);
        return [];
    }  
}

export const fetchHostContainerStatus_mock = (): Promise<HostContainerStatus[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          host_name: 'server-01',
          container_name: 'nginx-proxy',
          status: 'running',
          collected_at: '2025-06-12T10:01:00Z',
        },
        {
          id: 2,
          host_name: 'server-01',
          container_name: 'redis-cache',
          status: 'running',
          collected_at: '2025-06-12T10:01:00Z',
        },
        {
          id: 3,
          host_name: 'server-02',
          container_name: 'database-service',
          status: 'stopped',
          collected_at: '2025-06-12T10:06:00Z',
        },
        {
          id: 4,
          host_name: 'server-03',
          container_name: 'auth-service',
          status: 'running',
          collected_at: '2025-06-12T10:02:00Z',
        },
      ]);
    }, 600); // Simulate network delay
  });
};