pub trait ProgressReporter: Send + Sync { fn report(&self, progress: f64); fn is_cancelled(&self) -> bool; }
pub struct NoopReporter;
impl ProgressReporter for NoopReporter { fn report(&self, _p: f64) {} fn is_cancelled(&self) -> bool { false } }
pub struct PrintReporter;
impl ProgressReporter for PrintReporter { fn report(&self, p: f64) { eprint!("\rProgress: {:.1}%", p * 100.0); } fn is_cancelled(&self) -> bool { false } }