import { useParams } from "react-router-dom";
import { useEffect } from "react";
import api from "../services/api";

function PrintBill() {
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchAndPrint = async () => {
      try {
        const response = await api.get(`/bills/print/${id}`, {
          responseType: "text",
        });

        const printContent = response.data;

        // Replace full current page with printable HTML
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;

        window.print();

        // Restore original page after printing
        document.body.innerHTML = originalContent;

      } catch (err) {
        console.error("Printing error", err);
        alert("Failed to load bill for printing.");
      }
    };

    fetchAndPrint();
  }, [id]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h3>Opening Print Preview...</h3>
    </div>
  );
}

export default PrintBill;
