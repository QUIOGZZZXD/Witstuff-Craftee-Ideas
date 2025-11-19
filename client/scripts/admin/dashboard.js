async function fetchMetric(endpoint, key, selector) {
  try {
    const res = await fetch(`/api/admins/${endpoint}`);
    const { data, error } = await res.json();
    if (error) throw new Error(error);

    const value = data?.[key] ?? "—";
    document.querySelector(selector).textContent = value;
  } catch {
    document.querySelector(selector).textContent = "—";
  }
}

async function renderMonthlySalesChart() {
  try {
    const res = await fetch("/api/admins/monthly-sales-trends");
    const { data, error } = await res.json();
    if (error) throw new Error(error);

    const trends = data?.monthly_sales_trends || [];
    const labels = trends.map((t) => monthName(t.month));
    const values = trends.map((t) => t.total_sales);

    const ctx = document.getElementById("myBarChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Sales (in ₱)",
            data: values,
            backgroundColor: "#DBC8F0",
            borderColor: "#E3A5B9",
            borderWidth: 1,
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Monthly Sales Trends" },
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Sales in ₱" },
          },
          x: {
            title: { display: true, text: "Month" },
          },
        },
      },
    });
  } catch {
    console.error("Failed to render chart");
  }
}

function monthName(num) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[num - 1] || "Unknown";
}

async function renderRecentOrders() {
  try {
    const res = await fetch("/api/admins/order-items/recent");
    const { data, error } = await res.json();
    if (error) throw new Error(error);

    const container = document.querySelector(".orders-card");
    container.innerHTML = ""; // clear static content

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = "Recent Orders Section";
    container.appendChild(title);

    const recent = data?.recent_order_items || [];
    if (!recent.length) {
      const noData = document.createElement("p");
      noData.textContent = "No recent orders found.";
      container.appendChild(noData);
      return;
    }

    recent.forEach((item) => {
      const orderItem = document.createElement("div");
      orderItem.className = "order-item";

      const orderInfo = document.createElement("div");
      orderInfo.className = "order-info";

      const date = document.createElement("span");
      date.className = "date";
      date.textContent = formatDate(item.created_at);

      const customerDiv = document.createElement("div");
      customerDiv.className = "customer";

      const imgPlaceholder = document.createElement("div");
      imgPlaceholder.className = "img-placeholder";

      const customerText = document.createElement("div");
      const orderId = document.createElement("span");
      orderId.className = "order-id";
      orderId.textContent = `#ORD-${item.id}`;
      const br = document.createElement("br");
      const customerName = document.createElement("span");
      customerName.className = "customer-name";
      customerName.textContent = item.customer_name || "Unknown";

      customerText.append(orderId, br, customerName);
      customerDiv.append(imgPlaceholder, customerText);
      orderInfo.append(date, customerDiv);

      const orderMeta = document.createElement("div");
      orderMeta.className = "order-meta";

      const status = document.createElement("span");
      status.className = `status ${item.status
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      status.textContent = item.status;

      const total = document.createElement("span");
      total.className = "total";
      total.textContent = `Total: ₱${Number(item.subtotal).toLocaleString()}`;

      orderMeta.append(status, total);
      orderItem.append(orderInfo, orderMeta);

      container.appendChild(orderItem);
    });
  } catch (err) {
    console.error("Failed to render recent orders:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMetric("sales", "total_sales", ".metric-value.sales");
  fetchMetric("order-items/count", "count", ".metric-value.orders");
  fetchMetric("items/count", "count", ".metric-value.products");

  renderMonthlySalesChart();
  renderRecentOrders();
});
