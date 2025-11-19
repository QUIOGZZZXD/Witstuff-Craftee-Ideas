class OrderItemModal {
  constructor() {
    this.overlay = document.getElementById("modalOverlay");
    this.closeBtn = document.getElementById("closeBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.contactSellerBtn = document.getElementById("contactSellerBtn");

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.closeBtn.addEventListener("click", () => this.close());
    this.cancelBtn.addEventListener("click", () => this.close());
    this.contactSellerBtn.addEventListener("click", () =>
      this.handleContactSeller()
    );
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  getStatusBadgeClass(status) {
    const statusMap = {
      pending: "pending",
      shipped: "shipped",
      completed: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status?.toLowerCase()] || "pending";
  }

  open(orderItem) {
    // Populate product info
    document.getElementById("productImage").src =
      orderItem.image_url;
    document.getElementById("productName").textContent = orderItem.item_name;
    document.getElementById(
      "productDescription"
    ).textContent = `Order #${orderItem.order_item_id}`;

    // Populate status badge
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.textContent =
      orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1);
    statusBadge.className = `status-badge ${this.getStatusBadgeClass(
      orderItem.status
    )}`;

    // Populate seller info
    document.getElementById("shopName").textContent = orderItem.shop_name;
    document.getElementById("sellerEmail").textContent = orderItem.seller_email;
    document.getElementById("sellerName").textContent = orderItem.seller_name;

    // Populate pricing
    document.getElementById("unitPrice").textContent = this.formatPrice(
      orderItem.unit_price
    );
    document.getElementById(
      "quantity"
    ).textContent = `${orderItem.quantity} item(s)`;
    document.getElementById("totalPrice").textContent = this.formatPrice(
      orderItem.total_price
    );

    // Store current order item for contact action
    this.currentOrderItem = orderItem;

    // Show modal
    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.overlay.classList.remove("active");
    document.body.style.overflow = "auto";
    this.currentOrderItem = null;
  }

  handleContactSeller() {
    if (this.currentOrderItem) {
      const subject = `Question about: ${this.currentOrderItem.item_name}`;
      const body = `Hi ${this.currentOrderItem.seller_name},\n\nI have a question about my order:\nOrder ID: #${this.currentOrderItem.order_id}\nItem: ${this.currentOrderItem.item_name}\n\n`;
      const mailtoLink = `mailto:${
        this.currentOrderItem.seller_email
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;
      window.location.href = mailtoLink;
    }
  }
}