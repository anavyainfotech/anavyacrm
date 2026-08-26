export const dynamic = 'force-dynamic';

import { getCustomFieldsAction } from "@/features/custom-fields/actions";
import CustomFieldsView from "./CustomFieldsView";

export default async function CustomFieldsPage() {
  let fieldsList: any[] = [];

  try {
    const res = await getCustomFieldsAction("leads");
    if (res.success) {
      fieldsList = res.fields || [];
    }
  } catch (error) {
    console.error("Failed to load custom fields:", error);
  }

  return <CustomFieldsView initialFields={fieldsList} />;
}
