import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowEditStopReasons,
  GridRowParams,
  GridActionsCellItem,
  GridRowEditStopParams,
  GridRowId,
  GridRowModes, // Import GridRowModes
  GridRowModesModel,
  MuiBaseEvent,
  MuiEvent, // Import GridRowModesModel
} from '@mui/x-data-grid';
import { fetchRoles, Role } from '../../api/fetchRoles';
import { createRole } from '../../api/createRole';
import { updateRole } from '../../api/updateRole';
import { deleteRole } from '../../api/deleteRole';

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({}); // Use GridRowModesModel

  const getRoles = async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles.map((role: string) => ({ name: role })));
      setError(null);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unexpected error occurred.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  const handleRowEditStart = (params: GridRowParams) => {
    setRowModesModel((prevRowModesModel) => ({
      ...prevRowModesModel,
      [params.id]: { mode: GridRowModes.Edit }, // Use GridRowModes.Edit
    }));
  };

  const handleRowEditStop = (
    params: GridRowEditStopParams,
    event: MuiEvent<MuiBaseEvent>
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel((prevRowModesModel) => ({
      ...prevRowModesModel,
      [id as string]: { mode: GridRowModes.Edit }, // Use GridRowModes.Edit
    }));
  };

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel((prevRowModesModel) => ({
      ...prevRowModesModel,
      [id as string]: { mode: GridRowModes.View }, // Use GridRowModes.View
    }));
    const roleToUpdate = roles.find((role) => role.name === id);
    if (roleToUpdate) {
      try {
        await updateRole(roleToUpdate.name, roleToUpdate);
        await getRoles();
      } catch (err) {
        console.error('Error updating role:', err);
        setError(new Error('Failed to update role.'));
      }
    }
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    try {
      await deleteRole(id as string);
      setRoles(roles.filter((role) => role.name !== id));
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(new Error('Failed to delete role.'));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel((prevRowModesModel) => ({
      ...prevRowModesModel,
      [id as string]: { mode: GridRowModes.View }, // Use GridRowModes.View
    }));
    getRoles();
  };

  const processRowUpdate = async (newRow: Role) => {
    const updatedRow = { ...newRow };
    const oldRow = roles.find((role) => role.name === newRow.name);
    if (oldRow) {
      try {
        await updateRole(oldRow.name, updatedRow);
        await getRoles();
      } catch (err) {
        console.error('Error updating role:', err);
        setError(new Error('Failed to update role.'));
      }
    }
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => { // Use GridRowModesModel
    setRowModesModel(newRowModesModel);
  };

  const handleAddRole = async () => {
    const newRoleName = prompt('Enter the name of the new role:');
    if (newRoleName) {
      try {
        // await createRole({ name: newRoleName });
        await createRole( newRoleName );
        await getRoles();
      } catch (err) {
        console.error('Error creating role:', err);
        setError(new Error('Failed to create role.'));
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Role Name',
      width: 250,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit; // Use GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<Button size="small">Сохранить</Button>}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<Button size="small">Отменить</Button>}
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<Button size="small">Редактировать</Button>}
            label="Edit"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Button size="small">Удалить</Button>}
            label="Delete"
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleAddRole}>
          Добавить роль
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={roles.map((role) => ({ ...role, id: role.name }))}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          sx={{ maxWidth: '80%' }}
          editMode="row"
          rowModesModel={rowModesModel} // Use GridRowModesModel
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

export default RoleList;
