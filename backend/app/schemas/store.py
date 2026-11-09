from pydantic import BaseModel, Field


class StoreListingUpdate(BaseModel):
    """What the Keeper saves from Admin → Book Sale: one book and its price."""

    book_id: int | None = None
    price: int = Field(default=1, ge=1, le=500000)
    active: bool = False
    cta_label: str | None = Field(default=None, max_length=80)


class StoreListingBook(BaseModel):
    """The shelved volume the listing points at, as the console shows it."""

    id: int
    title: str
    image_url: str | None = None
    has_file: bool = False
    file_name: str | None = None


class StoreListingAdmin(BaseModel):
    book_id: int | None = None
    price: int = 0
    currency: str = "INR"
    active: bool = False
    cta_label: str | None = None
    book: StoreListingBook | None = None
    payments_configured: bool = False


class StoreBookPublic(BaseModel):
    """Everything the one-card sale page needs — and nothing else."""

    title: str
    description: str | None = None
    image_url: str | None = None
    price: int
    currency: str = "INR"
    cta_label: str | None = None
    format: str | None = None
    pages: int | None = None
    file_name: str | None = None
    # Razorpay's public key, so the page can open Checkout without a second call.
    key_id: str | None = None


class StoreOrderRequest(BaseModel):
    """Buyer details for the Razorpay receipt; Checkout collects them too."""

    email: str | None = Field(default=None, max_length=200)
    name: str | None = Field(default=None, max_length=120)


class StoreOrderResponse(BaseModel):
    orderId: str
    amount: int
    currency: str
    keyId: str
    title: str


class StoreVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class StoreVerifyResponse(BaseModel):
    paid: bool = True
    title: str
    file_name: str | None = None
    # Short-lived, signed download link for the volume just bought.
    download_url: str | None = None
