import { DropZone } from '../../components/atoms';
import { useCaseStore } from '../../store/caseStore';

/**
 * BTL bulk-import drop zone (.bulk-drop). Accepts CSV / spreadsheet
 * uploads listing portfolio properties so an investor's set of
 * securities populates in one go. Designed-in but only renders when
 * the case product family is Buy-to-Let — the MVP Owner Occupier
 * case never sees it. Conditional logic is in place.
 */
export default function BulkDrop() {
  const productFamily = useCaseStore((s) => s.case.arrangement.productFamily);
  if (productFamily !== 'Buy-to-Let') return null;
  return (
    <div className="bulk-drop">
      <DropZone
        label="BTL portfolio bulk import"
        sublabel="Drop a CSV, Excel sheet, or PDF schedule — Nova maps each row to a property."
        browseLabel="Choose file"
        accept=".csv,.xlsx,.xls,.pdf"
        onFiles={(files) => {
          // Wired up in a later step.
          void files;
        }}
      />
    </div>
  );
}
