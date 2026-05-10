import MvpAuthGate from "./MvpAuthGate";
import Workspace from "./Workspace";

export default function MVPApp() {
  return (
    <MvpAuthGate>
      <Workspace />
    </MvpAuthGate>
  );
}
