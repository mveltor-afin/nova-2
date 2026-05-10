import { useState } from 'react';
import { useCaseStore } from '../store/caseStore';
import PropertyList from './security/PropertyList';
import SecurityPills, { type SecuritySubTab } from './security/SecurityPills';
import BulkDrop from './security/BulkDrop';
import PropertySection from './security/sections/PropertySection';
import TenureSection from './security/sections/TenureSection';
import AttributesSection from './security/sections/AttributesSection';
import OccupancySection from './security/sections/OccupancySection';
import InsuranceSection from './security/sections/InsuranceSection';

/**
 * Security tab — Standalone v3 chapter 4.
 *  · Property cards at top
 *  · BTL bulk-import (conditional, hidden for MVP)
 *  · 5 sub-tab pills
 *  · Focused record below
 */
export default function SecurityTab() {
  const collaterals = useCaseStore((s) => s.case.collaterals);

  const [selectedUuid, setSelectedUuid] = useState(
    collaterals[0]?.uuid ?? '',
  );
  const [subTab, setSubTab] = useState<SecuritySubTab>('property');

  return (
    <div className="security-page">
      <PropertyList selectedUuid={selectedUuid} onSelect={setSelectedUuid} />

      <BulkDrop />

      <div className="security-record">
        <SecurityPills active={subTab} onChange={setSubTab} />

        {subTab === 'property' && <PropertySection collateralUuid={selectedUuid} />}
        {subTab === 'tenure' && <TenureSection collateralUuid={selectedUuid} />}
        {subTab === 'attributes' && (
          <AttributesSection collateralUuid={selectedUuid} />
        )}
        {subTab === 'occupancy' && (
          <OccupancySection collateralUuid={selectedUuid} />
        )}
        {subTab === 'insurance' && (
          <InsuranceSection collateralUuid={selectedUuid} />
        )}
      </div>
    </div>
  );
}
