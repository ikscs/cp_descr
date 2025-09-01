import React, { useState, useEffect, useCallback } from 'react';
import { Person } from './person.types';
import personApi from '../../api/data/personApiAxios';
import { useCustomer } from '../../context/CustomerContext';
// import PersonFormPlaceholder from './PersonFormPlaceholder'; // Placeholder form
import PersonForm /*{ PersonFormProps }*/ from './PersonForm'; // Import PersonFormProps
import PersonFaces from './PersonFaces'; // Import the new component
import { Alert, Avatar, Box, Button, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowIdGetter } from '@mui/x-data-grid';
import groupApi from '../../api/data/groupApiAxios';
import { useTranslation } from "react-i18next";
import LocalizedGrid from '../Shared/grid/LocalizedGrid';
import i18n from '../../i18n';
import { LocaleKey } from '../Shared/grid/locales';

interface PersonListProps {
  // Future props can be added here
}

const PersonList: React.FC<PersonListProps> = () => {
  const { t } = useTranslation();
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
      // const fetchedPersons: Person[] = await api.get(Number(customerData.customer));
      const fetchedPersons: Person[] = await personApi.get();
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

  const getGroupName = async (groupId: number): Promise<string> => {
    const group = await groupApi.getSingle(groupId);
    return group ? group.name : 'Неизвестная группа';
  };

  const handleSavePerson = async (submittedPerson: Person) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Сохранение персоны:', submittedPerson);
      let savedPerson: Person;

      const isActuallyNewInList = !persons.some(p => p.person_id === submittedPerson.person_id);
      if (isActuallyNewInList) {
      // if (submittedPerson.person_id === 0) { // Convention for new person
        const { person_id, ...personDataToPost } = submittedPerson;
        // savedPerson = await personApi.post(personDataToPost);
        // setPersons(prevPersons => [...prevPersons, savedPerson]);
        submittedPerson.group_name = await getGroupName(submittedPerson.group_id);
        setPersons(prevPersons => [...prevPersons, submittedPerson]);
      } else {
        if (!submittedPerson.person_id) {
          setError(new Error('ID персоны не может быть пустым для обновления.'));
          setIsSubmitting(false);
          return;
        }
        // savedPerson = await personApi.put(submittedPerson.person_id, submittedPerson);
        savedPerson = submittedPerson;
        savedPerson.group_name = await getGroupName(savedPerson.group_id);
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
      await personApi.delete(personId);
      setPersons(prevPersons => prevPersons.filter(person => person.person_id !== personId));
    } catch (err) {
      setError(new Error('Не удалось удалить персону.'));
      console.error('Ошибка при удалении персоны:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchPersons();
  };

  const handleOpenForm = (person: Person | null) => { // Renamed
    if (person) {
      setPersonForForm(person);
    } else {
      // For a new person, create a template object
      const newPersonObject: Person = {
        customer_id: customerData?.customer || -1,
        group_id: -1,
        group_name: '',
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
    // { field: 'customer_id', width: 90 },
    { field: 'person_id', headerName: 'ID', width: 100 },
    { field: 'group_name', headerName: t('PersonList.group'), width: 250 },
    { field: 'name', headerName: t('PersonList.name'), width: 250, flex: 1 },
    {
      field: 'photo',
      headerName: t('PersonList.photo'),
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Person>) => {
        if (params.row.photo) {
          const base64PhotoData = params.row.photo; // Предполагаем, что это уже строка Base64
          return (
            <Avatar
              src={`data:image/jpeg;base64,${base64PhotoData}`}
              alt="Person Photo"
              variant="rounded" // or "circular"
              sx={{ width: 50, height: 50 }}
            />
          );
        }
        return <Typography variant="caption">{t('PersonList.noPhoto')}</Typography>;
      },
    },    {
      field: 'actions',
      headerName: t('PersonList.Actions'),
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Person>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => handleOpenForm(params.row)}
            size="small"
            variant="outlined"
            disabled={isSubmitting}
          >
            {/* Редагувати */}
            {t('PersonList.edit')}
          </Button>
          <Button
            onClick={() => handleOpenFaces(params.row)}
            size="small"
            variant="outlined"
            disabled={isSubmitting}
          >
            {/* Фото */}
            {t('PersonList.faces')}
          </Button>
          <Button
            onClick={() => handleDeletePerson(params.row.person_id)}
            size="small"
            variant="outlined"
            color="error"
            disabled={isSubmitting}
          >
            {/* Видалити */}
            {t('PersonList.delete')}
          </Button>
        </Stack>
        </Box>
      ),
    },
  ];

  if (loading && persons.length === 0) return <Typography sx={{ p: 2 }}>Загрузка персон...</Typography>;
  
  const lang = i18n.language as LocaleKey;
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          {/* Персони */}
          {t('PersonList.title')}
        </Typography>
        <Stack direction="column" spacing={1}>
        <Button
          variant="contained"
          onClick={() => handleOpenForm(null)}
          disabled={isSubmitting || !customerData?.customer}
        >
          {/* Додати Персону */}
          {t('PersonList.addPerson')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleRefresh()}
          disabled={isSubmitting || !customerData?.customer}
        >
          {/* Оновити */}
          {t('PersonList.refresh')}
        </Button>
        </Stack>
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
        {/* <DataGrid */}
        <LocalizedGrid
          lang={lang}
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