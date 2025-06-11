let cart = {};
const taxRate = 0.2;

// Load cart from localStorage
if (localStorage.getItem("cart")) {
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || {};
  } catch (_) {
    localStorage.removeItem("cart");
    cart = {};
  }
}

// Fetch and display products

fetch("https://dummyjson.com/products/search?q=phone")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("product-container");
    data.products.forEach((product, index) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4 col";
      col.id = `product-${index}`;
      col.dataset.price = product.price;
      col.innerHTML = `
               <div class="card h-100">
                 <img src="${product.thumbnail}" class="card-img-top p-3 imgbg" alt="${product.title}" />
                 <div class="card-body d-flex flex-column">
                   <h5 class="card-title">${product.title}</h5
                   <p class="card-text">${product.description}</p>
                   <p class="card-text"><strong>$${product.price}</strong></p>
                   <div class="quantity-label text-success  mb-2"></div>
                   <button class="add-to-cart mt-auto btn btn-primary addCart">Add To Cart<i class="fa-solid fa-cart-shopping" style="padding-left:20px"></i></button>
                 </div>
               </div>`;
      container.appendChild(col);
      col.querySelector(".add-to-cart").addEventListener("click", () => {
        addToCart(col.id, product.price);
      });
      // 🛠 Ensure cart[id].price is set if item exists from storage but price was missing
      const id = `product-${index}`;
      if (cart[id] && !cart[id].price) {
        cart[id].price = product.price;
      }
    });
    //  Now it's safe to update summary
    updateSummary();
  });

function addToCart(id, price) {
  if (cart[id]) {
    cart[id].quantity += 1;
  } else {
    cart[id] = { quantity: 1, price };
  }
  saveCart();
  updateSummary();
}

function removeOneFromCart(id) {
  if (cart[id]) {
    cart[id].quantity -= 1;
    if (cart[id].quantity <= 0) delete cart[id];
  }

  saveCart();
  updateSummary();

  const card = document.getElementById(id);
  if (!card) return;

  if (cart[id]) {
    const qtyDiv = card.querySelector(".quantity-label");
    qtyDiv.textContent = `Quantity: ${cart[id].quantity}`;
  } else {
    card.remove();
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateSummary() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const id in cart) {
    let { quantity, price } = cart[id];
    quantity = Number(quantity);
    price = Number(price);
    if (!price || !quantity) continue; // 🛠 Skip invalid data
    totalItems += quantity;
    totalPrice += quantity * price;
  }

  const tax = totalPrice * taxRate;
  const grand = totalPrice + tax;

  document.getElementById("cost").textContent = totalItems;
  document.getElementById("cost1").textContent = `$${totalPrice.toFixed(2)}`;
  document.getElementById("cost2").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("cost3").textContent = `$${grand.toFixed(2)}`;
}

document.getElementById("reviewOrd").addEventListener("click", (e) => {
  e.preventDefault();

  document.querySelectorAll(".col").forEach((card) => {
    card.style.display = "none";
  });

  for (const id in cart) {
    const card = document.getElementById(id);
    if (!card) continue;

    card.style.display = "block";

    const qtyDiv = card.querySelector(".quantity-label");
    qtyDiv.classList.remove("hidden");
    qtyDiv.textContent = `Quantity: ${cart[id].quantity}`;

    const oldBtn = card.querySelector("button.add-to-cart");
    const delBtn = oldBtn.cloneNode(true);

    delBtn.textContent = "Delete";
    delBtn.classList.replace("btn-primary", "btn-danger");

    oldBtn.parentNode.replaceChild(delBtn, oldBtn);

    delBtn.addEventListener("click", () => {
      if (!cart[id].price) {
        cart[id].price = Number(card.dataset.price) || 0;
      }
      removeOneFromCart(id);
    });
  }
});
