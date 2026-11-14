//! Inventory sample: exercises most Rust token categories.

use std::collections::HashMap;
use std::fmt::{self, Display};
use std::sync::{Arc, Mutex};

pub mod units {
    pub const KILOGRAM: &str = "kg";

    /// Formats a value with its unit.
    pub fn format(value: f64, unit: &str) -> String {
        format!("{value:.2} {unit}")
    }
}

const MAX_ITEMS: usize = 1_000;
static TAX_RATE: f64 = 0.11;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Status {
    Draft,
    Active,
    Archived { since: u32 },
}

#[derive(Debug)]
pub enum InventoryError {
    Full(usize),
    InvalidSku(String),
}

impl Display for InventoryError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Full(n) => write!(f, "inventory full ({n} items)"),
            Self::InvalidSku(sku) => write!(f, "invalid SKU: {sku:?}"),
        }
    }
}

impl std::error::Error for InventoryError {}

pub trait Item: Send + Sync {
    fn sku(&self) -> &str;
    fn price(&self) -> f64;

    fn valid(&self) -> bool {
        let sku = self.sku();
        sku.len() >= 8 && sku.as_bytes()[3] == b'-'
    }
}

#[derive(Debug, Clone)]
pub struct Product<'a> {
    pub sku: &'a str,
    pub name: String,
    cost: f64,
    pub status: Status,
}

impl<'a> Item for Product<'a> {
    fn sku(&self) -> &str {
        self.sku
    }

    fn price(&self) -> f64 {
        self.cost * (1.0 + TAX_RATE)
    }
}

macro_rules! product {
    ($sku:expr, $name:expr, $cost:expr) => {
        Product { sku: $sku, name: $name.to_string(), cost: $cost, status: Status::Active }
    };
}

pub struct Store<T: Item> {
    items: Arc<Mutex<HashMap<String, T>>>,
}

impl<T> Store<T>
where
    T: Item + Clone,
{
    pub fn new() -> Self {
        Self { items: Arc::new(Mutex::new(HashMap::new())) }
    }

    /// Adds an item, returning the new count.
    pub fn add(&self, item: T) -> Result<usize, InventoryError> {
        let mut items = self.items.lock().unwrap();
        if items.len() >= MAX_ITEMS {
            return Err(InventoryError::Full(items.len()));
        }
        if !item.valid() {
            return Err(InventoryError::InvalidSku(item.sku().to_owned()));
        }
        items.insert(item.sku().to_owned(), item);
        Ok(items.len())
    }

    #[deprecated(since = "0.2.0", note = "use `total` instead")]
    pub fn sum(&self) -> f64 {
        self.total()
    }

    pub fn total(&self) -> f64 {
        self.items.lock().unwrap().values().map(|item| item.price()).sum()
    }
}

async fn report<T: Item + Clone>(store: &Store<T>) -> Option<String> {
    let total = store.total();
    if total > 0.0 { Some(units::format(total, units::KILOGRAM)) } else { None }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let store = Store::new();
    let products = vec![product!("ABC-1234", "Widget", 99.5), product!("bad", "Broken", 0x10 as f64)];

    for (index, product) in products.into_iter().enumerate() {
        match store.add(product) {
            Ok(count) => println!("#{index}: stored, {count} total"),
            Err(err @ InventoryError::InvalidSku(_)) => eprintln!("#{index}: {err}\n"),
            Err(err) => return Err(err.into()),
        }
    }

    let label = report(&store).await.unwrap_or_else(|| String::from("empty"));
    let raw = r#"raw "string" with \ backslash"#;
    let flags: [bool; 2] = [true, false];
    #[allow(deprecated)]
    let legacy = store.sum();
    println!("{label} {raw} {flags:?} {legacy} {}", 'c');
    Ok(())
}
