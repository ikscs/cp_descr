import React, { useState, useEffect } from 'react';
import { originApi } from '../../api/data/originApi'; // Import the actual originApi

const OriginsList = ({ onEditOrigin, onAddOrigin, pointIdFilter }) => {
  const [origins, setOrigins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrigins = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use originApi.getOrigins.
        // pointIdFilter can be passed directly; getOrigins handles undefined.
        const data = await originApi.getOrigins(pointIdFilter);
        setOrigins(data);
      } catch (err) {
        setError('Failed to fetch origins.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrigins();
  }, [pointIdFilter]); // Refetch if pointIdFilter changes

  const handleDelete = async (originId) => {
    if (window.confirm('Are you sure you want to delete this origin?')) {
      try {
        await originApi.deleteOrigin(originId);
        setOrigins(origins.filter(origin => origin.id !== originId));
      } catch (err) {
        setError('Failed to delete origin.');
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading origins...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Origins List</h2>
      <button onClick={onAddOrigin} style={{ marginBottom: '10px' }}>Add New Origin</button>
      {origins.length === 0 ? <p>No origins found.</p> : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Origin URL/Identifier</th>
              <th>Type ID</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {origins.map(origin => (
              <tr key={origin.id}>
                <td>{origin.id}</td>
                <td>{origin.name}</td>
                <td>{origin.origin}</td>
                <td>{origin.origin_type_id}</td>
                <td>{origin.is_enabled ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => onEditOrigin(origin)}>Edit</button>
                  <button onClick={() => handleDelete(origin.id)} style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OriginsList;
