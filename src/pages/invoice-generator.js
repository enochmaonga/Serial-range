import ProformaInvoice from "@/components/Invoice/InvoiceGen";
import Head from "next/head";

const Cars = () => {
  return (
    <>
      <Head>
        <title> Safaricom| Invoice</title>
      </Head>

      <ProformaInvoice />
    </>
  );
};

export default Cars;
