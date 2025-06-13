// import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personFormSchema, PersonFormValues } from './PersonForm.validation';
import { Person } from './person.types';
import personApi from '../../api/data/personApi'; // Assuming personApi is in d:/dvl/ikscs/react/vp-descr/mutant/src/api

export interface UsePersonFormProps {
  id?: number; // person_id for editing
  defaultGroupId?: number; // To pre-fill group_id for new persons
  onSuccess: (person: Person) => void;
  onError?: (error: any) => void;
}

export const usePersonForm = ({ id, defaultGroupId, onSuccess, onError }: UsePersonFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
    control, // Useful for controlled components like MUI Select with Controller
    // setValue,
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      name: '',
      group_id: defaultGroupId, // Will be undefined if defaultGroupId is not provided
    },
  });

//   useEffect(() => {
//     if (id) {
//       const fetchPerson = async () => {
//         try {
//           const personData = await personApi.getById(id);
//           if (personData) {
//             reset({
//               name: personData.name,
//               group_id: personData.group_id,
//             });
//           }
//         } catch (error) {
//           console.error("Failed to fetch person", error);
//           if (onError) onError(error);
//         }
//       };
//       fetchPerson();
//     } else {
//       // For new person, reset with current defaultGroupId if it changes or on initial setup
//       reset({ name: '', group_id: defaultGroupId });
//     }
//   }, [id, defaultGroupId, reset, setValue]);

  const onSubmit = async (data: PersonFormValues) => {
    try {
      const result: Person = id ? await personApi.put(id, data) : await personApi.post(data);
      onSuccess(result);
    } catch (error) {
      console.error("Failed to save person", error);
      if (onError) onError(error);
    }
  };

  return { register, handleSubmit: handleSubmit(onSubmit), reset, errors, isSubmitting, control, dirtyFields };
};