import { Component } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
          <Card style={{ maxWidth:480, textAlign:"center", padding:40 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:"#991B1B" }}>
              {Ico.alert(28)}
            </div>
            <h2 style={{ fontSize:20, fontWeight:700, color:T.text, margin:"0 0 8px" }}>Something went wrong</h2>
            <p style={{ fontSize:13, color:"#991B1B", background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", lineHeight:1.6, margin:"0 0 24px", wordBreak:"break-word" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <Btn primary onClick={() => { this.setState({ hasError: false, error: null }); this.props.onReset?.(); }}>
                Go to Dashboard
              </Btn>
              <Btn onClick={() => window.location.reload()}>
                Reload Page
              </Btn>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
