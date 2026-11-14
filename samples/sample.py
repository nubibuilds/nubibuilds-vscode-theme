#!/usr/bin/env python3
"""Order processing: exercises most Python token categories.

Module docstrings are documentation comments.
"""
from __future__ import annotations

import asyncio
import re
import warnings
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum, auto
from functools import lru_cache, wraps
from typing import Any, Callable, ClassVar, Generic, Iterator, Protocol, TypeVar

T = TypeVar("T", bound="Order")
MAX_RETRIES: int = 3
TAX_RATE = 0.11
SKU_RE = re.compile(r"^(?P<prefix>[A-Z]{3})-\d{4,6}$", re.IGNORECASE)


class Status(Enum):
    DRAFT = auto()
    PAID = auto()
    SHIPPED = auto()


class Priced(Protocol):
    def total(self) -> float: ...


def retry(times: int = MAX_RETRIES) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Retry an async function.

    Args:
        times: How many attempts to make.
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            for attempt in range(1, times + 1):
                try:
                    return await func(*args, **kwargs)
                except (ConnectionError, TimeoutError) as exc:
                    print(f"attempt {attempt}/{times} failed: {exc!r}")
                    await asyncio.sleep(0.1 * 2**attempt)
            raise RuntimeError("out of retries")

        return wrapper

    return decorator


@dataclass(frozen=True, slots=True)
class Line:
    sku: str
    quantity: int = 1
    unit_price: float = 0.0

    def total(self) -> float:
        return self.quantity * self.unit_price


@dataclass
class Order(ABC):
    id: int
    lines: list[Line] = field(default_factory=list)
    status: Status = Status.DRAFT
    count: ClassVar[int] = 0

    def __post_init__(self) -> None:
        type(self).count += 1

    def __iter__(self) -> Iterator[Line]:
        yield from self.lines

    @property
    def subtotal(self) -> float:
        return sum(line.total() for line in self)

    @staticmethod
    @lru_cache(maxsize=128)
    def valid_sku(sku: str) -> bool:
        return SKU_RE.match(sku) is not None

    @classmethod
    def empty(cls: type[T], id: int) -> T:
        return cls(id=id)

    @abstractmethod
    def shipping(self) -> float: ...

    def legacy_total(self) -> float:
        warnings.warn("use total()", DeprecationWarning, stacklevel=2)
        return self.total()

    def total(self) -> float:
        return round(self.subtotal * (1 + TAX_RATE) + self.shipping(), 2)


class Repository(Generic[T]):
    def __init__(self) -> None:
        self._items: dict[int, T] = {}

    @retry(times=2)
    async def save(self, order: T) -> None:
        if not all(Order.valid_sku(line.sku) for line in order):
            raise ValueError(f"invalid SKU in order #{order.id:04d}")
        self._items[order.id] = order


class WebOrder(Order):
    def shipping(self) -> float:
        return 0.0 if self.subtotal > 500_000 else 15_000.0


async def main() -> None:
    order = WebOrder(id=0x2A, lines=[Line("ABC-1234", 2, 99_500.0), Line("XYZ-0001")])
    repo: Repository[WebOrder] = Repository()
    await repo.save(order)
    flags = {"paid": True, "gift": False, "note": None}
    squares = [n**2 for n in range(10) if n % 2 == 0]
    print(f"{order.total():,.2f}", flags, squares, b"bytes\x00", lambda x: x or ...)


if __name__ == "__main__":
    asyncio.run(main())
