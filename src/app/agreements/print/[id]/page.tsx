import { getAgreementById } from "../../../(dashboard)/clients/actions";
import PrintAgreementClient from "./PrintAgreementClient";

export default async function PrintAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const aId = parseInt(resolvedParams.id);
  const data = await getAgreementById(aId);

  if (!data.success || !data.agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Agreement Not Found</h1>
          <p className="text-gray-500 mt-2">The requested agreement could not be located.</p>
          {data.error && <p className="text-red-500 mt-4 text-sm font-mono">{data.error}</p>}
        </div>
      </div>
    );
  }

  return (
    <PrintAgreementClient 
      agreement={data.agreement}
      client={data.client}
    />
  );
}
