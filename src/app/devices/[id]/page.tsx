import { DeviceForm } from "@/components/device-form";
import { DocumentList } from "@/components/document-list";
import { DeviceFinancials } from "@/components/device-financials";
import { DeviceBadge } from "@/components/device-badge";
import { getDevice } from "@/app/actions";
import { notFound } from "next/navigation";

interface DevicePageProps {
    params: Promise<{ id: string }>;
}

export default async function DevicePage({ params }: DevicePageProps) {
    const { id } = await params;
    const device = await getDevice(id);

    if (!device) {
        notFound();
    }

    // Serialize dates to strings to pass to client component
    const serializedDevice = {
        ...device,
        purchaseDate: device.purchaseDate.toISOString(),
        repairDate: device.repairDate?.toISOString() ?? null,
        saleDate: device.saleDate?.toISOString() ?? null,
        createdAt: device.createdAt.toISOString(),
        updatedAt: device.updatedAt.toISOString(),
        shippingBuyDate: device.shippingBuyDate?.toISOString() ?? null,
        shippingSellDate: device.shippingSellDate?.toISOString() ?? null,
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-10">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gerät bearbeiten</h1>
                        <p className="text-muted-foreground mt-1">ID: {device.id}</p>
                    </div>
                    <DeviceBadge
                        id={device.id}
                        model={device.model}
                        storage={device.storage}
                        imei={device.imei}
                    />
                </div>
                {/* @ts-ignore - Date serialization mismatch, handled in component */}
                <DeviceForm device={serializedDevice} />
            </div>

            <DeviceFinancials
                purchasePrice={device.purchasePrice}
                repairCost={device.repairCost || 0}
                shippingBuy={device.shippingBuy || 0}
                shippingSell={device.shippingSell || 0}
                salePrice={device.salePrice || 0}
                salesFees={device.salesFees || 0}
                isDiffTax={device.isDiffTax}
                status={device.status}
            />

            <DocumentList deviceId={device.id} documents={device.documents} />
        </div>
    );
}
