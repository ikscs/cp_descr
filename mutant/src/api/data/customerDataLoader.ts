// src/api/data/customerDataLoader.ts
import { CustomerData, CustomerPoint } from '../../context/CustomerContext';
import { getCustomer } from './customerTools'; // Припускаємо, що getCustomer знаходиться тут
import { pointApi } from './pointApi'; // Припускаємо, що pointApi знаходиться тут

/**
 * Loads initial customer data and their associated points.
 * This function is intended to be called once after user login
 * to populate the CustomerContext.
 *
 * @param userIdentifier - An identifier for the logged-in user (e.g., Userfront user ID)
 *                         which can be used to find the corresponding customer in your system.
 * @returns A Promise resolving to CustomerData or null if no customer is found.
 */
export const loadCustomerData = async (userIdentifier: string | number): Promise<CustomerData | null> => {
  try {
    // 1. Find the customer based on the user identifier
    //    NOTE: This assumes getCustomer can find a customer based on a user ID.
    //    You might need to adjust `getCustomer` or add a new API call here
    //    depending on how your user system links to your customer table.
    //    For this example, let's assume getCustomer(userIdentifier) works.
    //    If getCustomer expects a customer ID, you'd need an intermediate step
    //    to get the customer ID from the user identifier.
    const customerDetails = await getCustomer(Number(userIdentifier)); // Assuming userIdentifier can be cast to number for getCustomer

    if (!customerDetails || customerDetails.length === 0) {
      console.warn(`[customerDataLoader] No customer found for user identifier: ${userIdentifier}`);
      return null; // No customer found
    }

    // Assuming the first result is the primary customer
    const customer = customerDetails[0];
    const customerId = customer.customer_id; // Assuming the customer object has a 'customer' property for the ID

    // 2. Fetch points for this customer
    const apiPoints = await pointApi.getPoints(customerId);

    // Transform API points to CustomerPoint format for the context
    const customerPoints: CustomerPoint[] = apiPoints.map((point) => ({
      value: point.point_id,
      label: point.name,
    }));

    // 3. Construct the CustomerData object
    const customerData: CustomerData = {
      customer: customerId,
      // Optionally set a default selected point if needed, e.g., the first one
      // point_id: customerPoints.length > 0 ? customerPoints[0].value : undefined,
      points: customerPoints,
      country: customer.country || '',
      city: customer.city || '',
    };

    console.log('[customerDataLoader] Successfully loaded customer data:', customerData);
    return customerData;

  } catch (error) {
    console.error('[customerDataLoader] Error loading customer data:', error);
    // Depending on requirements, you might re-throw or return null/undefined
    throw error; // Re-throw the error so the caller can handle it (e.g., show an error message)
  }
};
