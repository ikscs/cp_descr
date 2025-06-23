import React, { useState, useEffect, useCallback } from 'react';
import { Person } from './person.types';
import api from '../../api/data/personApi'; // Adjusted API import
import { useCustomer } from '../../context/CustomerContext';
// import PersonFormPlaceholder from './PersonFormPlaceholder'; // Placeholder form
import PersonForm /*{ PersonFormProps }*/ from './PersonForm'; // Import PersonFormProps
import PersonFaces from './PersonFaces'; // Import the new component
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowIdGetter } from '@mui/x-data-grid';

interface PersonListProps {
  // Future props can be added here
}

const PersonList: React.FC<PersonListProps> = () => {
  const { customerData } = useCustomer();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [personForForm, setPersonForForm] = useState<Person | null>(null); // Renamed
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false); // Renamed
  const [isFacesOpen, setIsFacesOpen] = useState(false);

  const fetchPersons = useCallback(async () => {
    if (!customerData?.customer) {
      setPersons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedPersons: Person[] = await api.get(Number(customerData.customer));
      setPersons(fetchedPersons);
    } catch (err) {
      setError(new Error('Не удалось загрузить список персон.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customerData?.customer]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const handleSavePerson = async (submittedPerson: Person) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Сохранение персоны:', submittedPerson);
      let savedPerson: Person;

      if (submittedPerson.person_id === 0) { // Convention for new person
        const { person_id, ...personDataToPost } = submittedPerson;
        savedPerson = await api.post(personDataToPost);
        setPersons(prevPersons => [...prevPersons, savedPerson]);
      } else {
        if (!submittedPerson.person_id) {
          setError(new Error('ID персоны не может быть пустым для обновления.'));
          setIsSubmitting(false);
          return;
        }
        savedPerson = await api.put(submittedPerson.person_id, submittedPerson);
        setPersons(prevPersons =>
          prevPersons.map(p => (p.person_id === savedPerson.person_id ? savedPerson : p))
        );
      }
      setIsFormOpen(false); // Close form on successful save
      setPersonForForm(null);
    } catch (err) {
      setError(new Error('Не удалось изменить/добавить персону.'));
      console.error('Ошибка при сохранении/добавлении персоны:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePerson = async (personId: number) => {
    if (!window.confirm(`Вы уверены, что хотите удалить персону с ID ${personId}?`)) {
      return;
    }
    setIsSubmitting(true); // Disable other actions during delete
    setError(null);
    try {
      console.log(`Удаление персоны с ID: ${personId}`);
      await api.delete(personId);
      setPersons(prevPersons => prevPersons.filter(person => person.person_id !== personId));
    } catch (err) {
      setError(new Error('Не удалось удалить персону.'));
      console.error('Ошибка при удалении персоны:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForm = (person: Person | null) => { // Renamed
    if (person) {
      setPersonForForm(person);
    } else {
      // For a new person, create a template object
      const newPersonObject: Person = {
        customer_id: customerData?.customer || -1,
        group_id: -1,
        person_id: 0, // Temporary ID for new, handled in handleSavePerson
        name: '',
        // email: '',
      };
      setPersonForForm(newPersonObject);
    }
    setIsFormOpen(true);
  };

  const handleOpenFaces = (person: Person) => {
    setPersonForForm(person);
    setIsFacesOpen(true);
  }

  const handleCloseFaces = () => {
    setIsFacesOpen(false);
    setPersonForForm(null); // Clear selected person when closing faces modal
  }

  const handleCloseForm = () => { // Renamed
    setIsFormOpen(false);
    setPersonForForm(null);
  };

  const getRowId: GridRowIdGetter<Person> = (row) => row.person_id;

  const columns: GridColDef<Person>[] = [
    { field: 'customer_id', width: 90 },
    { field: 'group_id', width: 90 },
    { field: 'person_id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 250, flex: 1 },
    { field: 'email', headerName: 'Email', width: 250, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Person>) => (
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => handleOpenForm(params.row)}
            size="small"
            variant="outlined"
            disabled={isSubmitting}
          >
            Редагувати
          </Button>
          <Button
            onClick={() => handleOpenFaces(params.row)}
            size="small"
            variant="outlined"
            disabled={isSubmitting}
          >
            Фото
          </Button>
          <Button
            onClick={() => handleDeletePerson(params.row.person_id)}
            size="small"
            variant="outlined"
            color="error"
            disabled={isSubmitting}
          >
            Видалити
          </Button>
        </Stack>
      ),
    },
  ];

  if (loading && persons.length === 0) return <Typography sx={{ p: 2 }}>Загрузка персон...</Typography>;
  
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          Персони
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenForm(null)}
          disabled={isSubmitting || !customerData?.customer}
        >
          Додати Персону
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}
      {!customerData?.customer && !loading && (
         <Alert severity="info" sx={{ mb: 2 }}>Выберите клиента для просмотра списка персон.</Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={persons}
          columns={columns}
          getRowId={getRowId}
          pageSizeOptions={[5, 10, 25]}
          loading={loading}
          autoHeight={false}
        />
      </Box>

      {/* Render PersonForm directly; it's a Dialog component itself */}
      {isFormOpen && personForForm && (
        <PersonForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSaved={handleSavePerson} // handleSavePerson in PersonList handles API calls and state updates
          personToEdit={personForForm}
          // Optionally, pass a defaultGroupId if PersonList has a specific context for it
          // defaultGroupId={personForForm?.person_id === 0 ? personForForm.group_id : undefined}
        />
        // <PersonFacesGallery personId={personForForm.person_id} columns={3} />
      )} {/* PersonForm is a Dialog */}

      {/* Render PersonFaces (which contains the Modal) */}
      {isFacesOpen && personForForm?.person_id !== undefined && personForForm.person_id !== 0 && (
         <PersonFaces open={isFacesOpen} onClose={handleCloseFaces} personId={personForForm.person_id} />
      )} {/* PersonFaces handles its own Modal */}

    </Box>
  );
};

export default PersonList;