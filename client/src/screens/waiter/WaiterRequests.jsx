import WaiterLayout, { WaiterPageHeader } from "./WaiterLayout";
import RequestsBoard from "@/screens/shared/RequestsBoard";

export default function WaiterRequests() {
  return (
    <WaiterLayout>
      <WaiterPageHeader
        title="Customer Requests"
        subtitle="Respond to guest assistance requests from your tables."
      />
      <div className="px-5 py-5">
        <RequestsBoard />
      </div>
    </WaiterLayout>
  );
}
