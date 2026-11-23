(function () {
  function initApp() {
    const PANADERIA_ITEMS = [
      {
        id: "pre-pizza-lalos",
        name: "Pre Pizza Lalos (8 porciones)",
        category: "panaderia",
        categoryLabel: "PANADERÍA",
        price: 10.5,
        img: "img/panaderia1.JPG",
        desc: "Base de pizza lista para hornear en casa (240 g, 8 porciones)."
      },
      {
        id: "pan-multigrano-lalos",
        name: "Pan de molde Multi Grano",
        category: "panaderia",
        categoryLabel: "PANADERÍA",
        price: 9.5,
        img: "img/panaderia2.jpg",
        desc: "Pan de molde con ajonjolí, linaza y avena para desayunos nutritivos."
      },
      {
        id: "pan-masa-madre-lalos",
        name: "Pan de molde Masa Madre",
        category: "panaderia",
        categoryLabel: "PANADERÍA",
        price: 11.0,
        img: "img/panaderia3.JPG",
        desc: "Fermentación natural con masa madre, textura suave y sabor artesanal."
      },
      {
        id: "proximamente-tortas",
        name: "Tortas",
        category: "proximamente",
        categoryLabel: "TORTAS · PRÓXIMAMENTE (FASE 3)",
        price: null,
        img: "img/portada.jpg",
        desc: "Línea de tortas artesanales disponible en la Fase 3 del proyecto."
      },
      {
        id: "proximamente-pizzas",
        name: "Pizzas",
        category: "proximamente",
        categoryLabel: "PIZZAS · PRÓXIMAMENTE (FASE 3)",
        price: null,
        img: "img/panaderia1.JPG",
        desc: "Pizzas recién horneadas disponibles en la Fase 3 del proyecto."
      },
      {
        id: "proximamente-pastas",
        name: "Pastas",
        category: "proximamente",
        categoryLabel: "PASTAS · PRÓXIMAMENTE (FASE 3)",
        price: null,
        img: "img/portada.jpg",
        desc: "Especialidades de pastas disponibles en la Fase 3 del proyecto."
      }
    ];

    const CATERING_ITEMS = [
      {
        id: "catering-empresarial",
        name: "Catering Empresarial",
        category: "catering",
        categoryLabel: "CATERING",
        price: 180.0,
        img: "img/catring_empresas.jpg",
        desc: "Mesa de bocaditos dulces y salados para eventos corporativos y reuniones."
      },
      {
        id: "catering-bodas",
        name: "Catering para Bodas",
        category: "catering",
        categoryLabel: "CATERING",
        price: 450.0,
        img: "img/cateringboda.jpg",
        desc: "Montaje completo con empanadas, postres en copa, alfajores y torta."
      },
      {
        id: "catering-coffee-break",
        name: "Catering Coffee Break",
        category: "catering",
        categoryLabel: "CATERING",
        price: 140.0,
        img: "img/catering1.jpg",
        desc: "Tartaletas de kiwi, volovanes de lúcuma y estación de bocaditos."
      },
      {
        id: "catering-familiar",
        name: "Catering Familiar",
        category: "catering",
        categoryLabel: "CATERING",
        price: 160.0,
        img: "img/catering2.jpg",
        desc: "Estación móvil con bebidas calientes, sándwiches y bocaditos para grupos."
      }
    ];

    const ALL_ITEMS = [...PANADERIA_ITEMS, ...CATERING_ITEMS];

    // Memoria segura en memoria + respaldo en localStorage si está permitido
    let memoryFavs = [];
    let memoryCart = [];

    function readStorage(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    }

    function writeStorage(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        // En algunos modos file:// o privados localStorage lanza excepción; no bloqueamos la app
      }
    }

    let favorites = readStorage("lalos_favs_v3", memoryFavs);
    let cart = readStorage("lalos_cart_v3", memoryCart);
    let currentView = "inicio";
    let panFilter = "todos";
    let catFilter = "todos";
    let searchQuery = "";
    let pendingQtyItem = null;
    let currentQty = 1;

    function persist() {
      memoryFavs = [...favorites];
      memoryCart = [...cart];
      writeStorage("lalos_favs_v3", favorites);
      writeStorage("lalos_cart_v3", cart);
    }

    function formatMoney(num) {
      return "S/ " + Number(num || 0).toFixed(2);
    }

    function showToast(msg) {
      const container = document.getElementById("toast-container");
      if (!container) return;
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      container.appendChild(el);
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 2500);
    }

    // Elementos DOM
    const panaderiaGrid = document.getElementById("panaderia-grid");
    const cateringGrid = document.getElementById("catering-grid");
    const panaderiaChips = document.getElementById("panaderia-chips");
    const cateringChips = document.getElementById("catering-chips");

    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const searchCategory = document.getElementById("search-category");

    const favCountEl = document.getElementById("fav-count");
    const toggleFavOnlyBtn = document.getElementById("toggle-fav-only-btn");
    const cartCountEl = document.getElementById("cart-count");
    const cartSubtotalEl = document.getElementById("cart-subtotal");
    const drawerSubtotalEl = document.getElementById("drawer-subtotal");
    const cartItemsList = document.getElementById("cart-items-list");
    const openCartBtn = document.getElementById("open-cart-btn");
    const cartDrawerBackdrop = document.getElementById("cart-drawer-backdrop");
    const cartDrawerClose = document.getElementById("cart-drawer-close");
    const openCheckoutBtn = document.getElementById("open-checkout-btn");

    const catDropdown = document.getElementById("categories-dropdown");
    const catToggle = document.getElementById("categories-toggle");
    const catArrow = document.getElementById("categories-arrow");
    const catMenu = document.getElementById("categories-menu");

    const qtyBackdrop = document.getElementById("qty-modal-backdrop");
    const qtyClose = document.getElementById("qty-modal-close");
    const qtyImg = document.getElementById("qty-modal-img");
    const qtyCat = document.getElementById("qty-modal-cat");
    const qtyTitle = document.getElementById("qty-modal-title");
    const qtyPrice = document.getElementById("qty-modal-price");
    const qtyMinus = document.getElementById("qty-minus");
    const qtyPlus = document.getElementById("qty-plus");
    const qtyValue = document.getElementById("qty-value");
    const qtySubtotalPreview = document.getElementById("qty-subtotal-preview");
    const confirmAddCart = document.getElementById("confirm-add-cart");

    const checkoutBackdrop = document.getElementById("checkout-modal-backdrop");
    const checkoutClose = document.getElementById("checkout-close");
    const paymentDetailBox = document.getElementById("payment-detail-box");
    const orderSummaryBox = document.getElementById("order-summary-box");
    const orderResultBox = document.getElementById("order-result-box");
    const step4Actions = document.getElementById("step-4-actions");

    function setCategoriesOpen(open) {
      if (!catMenu || !catToggle) return;
      catMenu.classList.toggle("open", open);
      catToggle.setAttribute("aria-expanded", String(open));
      if (catArrow) catArrow.textContent = open ? "^" : "⌄";
    }

    function syncPanChips() {
      if (!panaderiaChips) return;
      panaderiaChips.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.panFilter === panFilter);
      });
    }

    function syncCatChips() {
      if (!cateringChips) return;
      cateringChips.querySelectorAll(".chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.catFilter === catFilter);
      });
    }

    function buildCardHTML(item) {
      const isFav = favorites.indexOf(item.id) !== -1;
      const isComingSoon = item.category === "proximamente";
      return `
        <article class="product-card">
          <div class="product-img-wrap">
            <img src="${item.img}" alt="${item.name}" />
            <button
              type="button"
              class="fav-btn-card ${isFav ? "is-fav" : ""}"
              data-fav-id="${item.id}"
              aria-pressed="${isFav}"
              aria-label="Favorito ${item.name}"
            >
              ${isFav ? "❤️" : "🤍"}
            </button>
          </div>
          <div class="product-body">
            <span class="product-cat-label">${item.categoryLabel}</span>
            <h3 class="product-title">${item.name}</h3>
            <p class="product-desc">${item.desc}</p>
            <div class="product-footer">
              ${
                isComingSoon
                  ? `<span class="coming-soon-badge">PRÓXIMAMENTE (Fase 3)</span>`
                  : `
                    <span class="product-price">${formatMoney(item.price)}</span>
                    <button type="button" class="btn-add-cart" data-add-id="${item.id}">
                      Añadir al carrito
                    </button>
                  `
              }
            </div>
          </div>
        </article>
      `;
    }

    function renderPanaderia() {
      if (!panaderiaGrid) return;
      const q = searchQuery.trim().toLowerCase();
      const filtered = PANADERIA_ITEMS.filter((item) => {
        if (panFilter === "todos" && item.category !== "panaderia") return false;
        if (panFilter === "proximamente" && item.category !== "proximamente") return false;
        if (panFilter === "favoritos" && favorites.indexOf(item.id) === -1) return false;
        if (q) {
          const match =
            item.name.toLowerCase().indexOf(q) !== -1 ||
            item.desc.toLowerCase().indexOf(q) !== -1;
          if (!match) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        panaderiaGrid.innerHTML = `<p class="empty-catalog-msg">No hay productos en Panadería con ese filtro.</p>`;
        return;
      }
      panaderiaGrid.innerHTML = filtered.map(buildCardHTML).join("");
    }

    function renderCatering() {
      if (!cateringGrid) return;
      const q = searchQuery.trim().toLowerCase();
      const filtered = CATERING_ITEMS.filter((item) => {
        if (catFilter === "favoritos" && favorites.indexOf(item.id) === -1) return false;
        if (q) {
          const match =
            item.name.toLowerCase().indexOf(q) !== -1 ||
            item.desc.toLowerCase().indexOf(q) !== -1;
          if (!match) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        cateringGrid.innerHTML = `<p class="empty-catalog-msg">No hay servicios de Catering con ese filtro.</p>`;
        return;
      }
      cateringGrid.innerHTML = filtered.map(buildCardHTML).join("");
    }

    function switchView(viewName, opts) {
      const options = opts || {};
      const valid = ["inicio", "panaderia", "catering", "nosotros", "ubicacion"];
      const target = valid.indexOf(viewName) !== -1 ? viewName : "inicio";
      currentView = target;

      document.querySelectorAll(".page-view").forEach((sec) => {
        sec.classList.toggle("active", sec.id === "view-" + target);
      });

      document.querySelectorAll(".nav-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.viewTarget === target);
      });

      if (target === "panaderia") {
        if (searchCategory) searchCategory.value = "panaderia";
        if (options.upcoming) {
          panFilter = "proximamente";
          syncPanChips();
        }
        renderPanaderia();
      } else if (target === "catering") {
        if (searchCategory) searchCategory.value = "catering";
        renderCatering();
      }

      if (!options.skipScroll) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    // Delegación global de navegación por ventanas
    document.addEventListener("click", (e) => {
      const navTarget = e.target.closest("[data-view-target]");
      if (navTarget) {
        e.preventDefault();
        const view = navTarget.dataset.viewTarget;
        const upcoming = navTarget.dataset.upcoming === "1";
        switchView(view, { upcoming });
        setCategoriesOpen(false);
        return;
      }

      if (catDropdown && !catDropdown.contains(e.target)) {
        setCategoriesOpen(false);
      }
    });

    if (panaderiaChips) {
      panaderiaChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        panFilter = chip.dataset.panFilter;
        syncPanChips();
        renderPanaderia();
      });
    }

    if (cateringChips) {
      cateringChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        catFilter = chip.dataset.catFilter;
        syncCatChips();
        renderCatering();
      });
    }

    // Favoritos
    function updateFavBadge() {
      if (favCountEl) favCountEl.textContent = String(favorites.length);
    }

    function toggleFavorite(id) {
      const idx = favorites.indexOf(id);
      if (idx !== -1) {
        favorites.splice(idx, 1);
        showToast("Quitado de favoritos");
      } else {
        favorites.push(id);
        showToast("Añadido a favoritos ❤️");
      }
      persist();
      updateFavBadge();
      renderPanaderia();
      renderCatering();
    }

    if (toggleFavOnlyBtn) {
      toggleFavOnlyBtn.addEventListener("click", () => {
        if (currentView === "catering") {
          catFilter = catFilter === "favoritos" ? "todos" : "favoritos";
          syncCatChips();
          renderCatering();
        } else {
          panFilter = "favoritos";
          syncPanChips();
          switchView("panaderia");
        }
      });
    }

    function onCatalogClick(e) {
      const favBtn = e.target.closest("[data-fav-id]");
      if (favBtn) {
        toggleFavorite(favBtn.dataset.favId);
        return;
      }
      const addBtn = e.target.closest("[data-add-id]");
      if (addBtn) {
        const item = ALL_ITEMS.find((p) => p.id === addBtn.dataset.addId);
        if (item && item.price !== null) openQtyModal(item);
      }
    }

    if (panaderiaGrid) panaderiaGrid.addEventListener("click", onCatalogClick);
    if (cateringGrid) cateringGrid.addEventListener("click", onCatalogClick);

    // Modal de cantidad
    function updateQtyPreview() {
      if (qtyValue) qtyValue.textContent = String(currentQty);
      if (qtySubtotalPreview && pendingQtyItem && pendingQtyItem.price !== null) {
        qtySubtotalPreview.textContent = "Subtotal: " + formatMoney(pendingQtyItem.price * currentQty);
      }
    }

    function openQtyModal(item) {
      pendingQtyItem = item;
      currentQty = 1;
      if (qtyImg) {
        qtyImg.src = item.img;
        qtyImg.alt = item.name;
      }
      if (qtyCat) qtyCat.textContent = item.categoryLabel;
      if (qtyTitle) qtyTitle.textContent = item.name;
      if (qtyPrice) qtyPrice.textContent = formatMoney(item.price);
      updateQtyPreview();
      if (qtyBackdrop) {
        qtyBackdrop.classList.add("open");
        qtyBackdrop.setAttribute("aria-hidden", "false");
      }
    }

    function closeQtyModal() {
      if (qtyBackdrop) {
        qtyBackdrop.classList.remove("open");
        qtyBackdrop.setAttribute("aria-hidden", "true");
      }
      pendingQtyItem = null;
    }

    if (qtyMinus) {
      qtyMinus.addEventListener("click", () => {
        if (currentQty > 1) {
          currentQty -= 1;
          updateQtyPreview();
        }
      });
    }

    if (qtyPlus) {
      qtyPlus.addEventListener("click", () => {
        currentQty += 1;
        updateQtyPreview();
      });
    }

    if (qtyClose) qtyClose.addEventListener("click", closeQtyModal);

    if (confirmAddCart) {
      confirmAddCart.addEventListener("click", () => {
        if (!pendingQtyItem) return;
        const found = cart.find((c) => c.id === pendingQtyItem.id);
        if (found) {
          found.qty += currentQty;
        } else {
          cart.push({
            id: pendingQtyItem.id,
            name: pendingQtyItem.name,
            price: pendingQtyItem.price,
            img: pendingQtyItem.img,
            qty: currentQty
          });
        }
        persist();
        updateCartUI();
        showToast("Añadido: " + currentQty + " × " + pendingQtyItem.name);
        closeQtyModal();
      });
    }

    // Carrito
    function getSubtotal() {
      return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    function updateCartUI() {
      const totalUnits = cart.reduce((acc, item) => acc + item.qty, 0);
      const sub = getSubtotal();

      if (cartCountEl) cartCountEl.textContent = String(totalUnits);
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(sub);
      if (drawerSubtotalEl) drawerSubtotalEl.textContent = formatMoney(sub);
      if (openCheckoutBtn) openCheckoutBtn.disabled = cart.length === 0;

      if (!cartItemsList) return;
      if (cart.length === 0) {
        cartItemsList.innerHTML = `<p class="empty-cart-msg">Tu carrito está vacío. Añade un producto de Panadería o Catering.</p>`;
        return;
      }

      cartItemsList.innerHTML = cart
        .map(
          (item) => `
          <div class="cart-item-row">
            <img src="${item.img}" alt="${item.name}" />
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span>${formatMoney(item.price)} c/u</span>
              <div class="cart-item-controls">
                <button type="button" data-cart-dec="${item.id}" aria-label="Restar">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-inc="${item.id}" aria-label="Sumar">+</button>
                <button type="button" class="remove-item-btn" data-cart-del="${item.id}" aria-label="Eliminar">🗑</button>
              </div>
            </div>
            <strong>${formatMoney(item.price * item.qty)}</strong>
          </div>
        `
        )
        .join("");
    }

    function openCartDrawer() {
      if (cartDrawerBackdrop) {
        cartDrawerBackdrop.classList.add("open");
        cartDrawerBackdrop.setAttribute("aria-hidden", "false");
      }
    }

    function closeCartDrawer() {
      if (cartDrawerBackdrop) {
        cartDrawerBackdrop.classList.remove("open");
        cartDrawerBackdrop.setAttribute("aria-hidden", "true");
      }
    }

    if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
    if (cartDrawerClose) cartDrawerClose.addEventListener("click", closeCartDrawer);

    if (cartItemsList) {
      cartItemsList.addEventListener("click", (e) => {
        const decId = e.target.dataset.cartDec;
        const incId = e.target.dataset.cartInc;
        const delId = e.target.dataset.cartDel;

        if (decId) {
          const it = cart.find((c) => c.id === decId);
          if (it) {
            if (it.qty > 1) it.qty -= 1;
            else cart = cart.filter((c) => c.id !== decId);
            persist();
            updateCartUI();
          }
        } else if (incId) {
          const it = cart.find((c) => c.id === incId);
          if (it) {
            it.qty += 1;
            persist();
            updateCartUI();
          }
        } else if (delId) {
          cart = cart.filter((c) => c.id !== delId);
          persist();
          updateCartUI();
          showToast("Producto quitado del carrito");
        }
      });
    }

    // Pasarela simulada de 4 pasos
    function getDeliveryCost() {
      const checked = document.querySelector('input[name="delivery-type"]:checked');
      const mode = checked ? checked.value : "recojo";
      if (mode === "recojo") return 0;
      return getSubtotal() >= 50 ? 0 : 5;
    }

    function updateDeliveryLabel() {
      const lbl = document.getElementById("delivery-cost-label");
      if (!lbl) return;
      lbl.textContent =
        getSubtotal() >= 50
          ? "Gratis (S/ 0.00) — Tu pedido supera S/ 50.00"
          : "S/ 5.00 (Gratis desde S/ 50.00)";
    }

    function renderPaymentDetail() {
      if (!paymentDetailBox) return;
      const checked = document.querySelector('input[name="pay-method"]:checked');
      const method = checked ? checked.value : "Yape";

      document.querySelectorAll(".pm-option").forEach((opt) => {
        const inp = opt.querySelector("input");
        opt.classList.toggle("active", Boolean(inp && inp.value === method));
      });

      if (method === "Yape" || method === "Plin") {
        paymentDetailBox.innerHTML = `
          <strong>Pago simulado con ${method}</strong>
          <div class="qr-fake" title="QR de demostración"></div>
          <p style="text-align:center;">QR simulado para <strong>Lalos Panadería</strong> (no realiza cobro real).</p>
        `;
      } else if (method === "Tarjeta") {
        paymentDetailBox.innerHTML = `
          <strong>Tarjeta simulada (Visa / Mastercard)</strong>
          <div class="form-group" style="margin-top:8px; margin-bottom:0;">
            <label for="sim-card">Número de tarjeta (ejemplo)</label>
            <input type="text" id="sim-card" placeholder="4532 •••• •••• 0000" />
          </div>
        `;
      } else if (method === "Efectivo") {
        paymentDetailBox.innerHTML = `
          <strong>Pago en efectivo (Simulado)</strong>
          <p style="margin-top:6px;">Se registra como pago en efectivo al recoger o recibir el pedido (sin cargo online).</p>
        `;
      } else {
        paymentDetailBox.innerHTML = `
          <strong>Transferencia bancaria (Simulada)</strong>
          <p style="margin-top:6px;">Cuenta referencial de prueba: <strong>Lalos Panadería · CCI Demo 002-000-000000000000-00</strong>.</p>
        `;
      }
    }

    function renderOrderSummary() {
      if (!orderSummaryBox) return;
      const nameVal = (document.getElementById("customer-name")?.value || "").trim();
      const phoneVal = (document.getElementById("customer-phone")?.value || "").trim();
      const delChecked = document.querySelector('input[name="delivery-type"]:checked');
      const deliveryMode = delChecked ? delChecked.value : "recojo";
      const addrVal = (document.getElementById("delivery-address")?.value || "").trim();
      const payChecked = document.querySelector('input[name="pay-method"]:checked');
      const payMethod = payChecked ? payChecked.value : "Yape";

      const sub = getSubtotal();
      const env = getDeliveryCost();
      const tot = sub + env;

      if (orderResultBox) orderResultBox.style.display = "none";
      if (step4Actions) step4Actions.style.display = "flex";

      orderSummaryBox.innerHTML = `
        <p><strong>Cliente:</strong> ${nameVal} (${phoneVal})</p>
        <p><strong>Entrega:</strong> ${deliveryMode === "recojo" ? "Recojo en tienda (Av. Giráldez 363)" : "Delivery — " + addrVal}</p>
        <p><strong>Método de pago:</strong> ${payMethod} (Simulado)</p>
        <hr style="margin:8px 0; border:none; border-top:1px solid #e5d8c8;" />
        <p><strong>Subtotal:</strong> ${formatMoney(sub)}</p>
        <p><strong>Envío:</strong> ${formatMoney(env)}</p>
        <p><strong>Total a pagar (simulado):</strong> ${formatMoney(tot)}</p>
      `;
    }

    function goToStep(stepNum) {
      document.querySelectorAll(".checkout-step").forEach((el, i) => {
        el.classList.toggle("active", i + 1 === stepNum);
      });
      document.querySelectorAll(".step-pill").forEach((pill) => {
        pill.classList.toggle("active", Number(pill.dataset.step) <= stepNum);
      });
      if (stepNum === 2) updateDeliveryLabel();
      if (stepNum === 3) renderPaymentDetail();
      if (stepNum === 4) renderOrderSummary();
    }

    if (openCheckoutBtn) {
      openCheckoutBtn.addEventListener("click", () => {
        closeCartDrawer();
        if (orderResultBox) orderResultBox.style.display = "none";
        if (step4Actions) step4Actions.style.display = "flex";
        goToStep(1);
        if (checkoutBackdrop) {
          checkoutBackdrop.classList.add("open");
          checkoutBackdrop.setAttribute("aria-hidden", "false");
        }
      });
    }

    function closeCheckoutModal() {
      if (checkoutBackdrop) {
        checkoutBackdrop.classList.remove("open");
        checkoutBackdrop.setAttribute("aria-hidden", "true");
      }
    }

    if (checkoutClose) checkoutClose.addEventListener("click", closeCheckoutModal);

    const toStep2Btn = document.getElementById("to-step-2");
    if (toStep2Btn) {
      toStep2Btn.addEventListener("click", () => {
        const nameInput = document.getElementById("customer-name");
        const phoneInput = document.getElementById("customer-phone");
        const nameErr = document.getElementById("name-error");
        const phoneErr = document.getElementById("phone-error");
        if (nameErr) nameErr.textContent = "";
        if (phoneErr) phoneErr.textContent = "";

        const nameTxt = (nameInput?.value || "").trim();
        const digits = (phoneInput?.value || "").replace(/\D/g, "");
        let ok = true;
        if (nameTxt.length < 3) {
          if (nameErr) nameErr.textContent = "Ingresa tu nombre completo (mínimo 3 caracteres).";
          ok = false;
        }
        if (digits.length < 9) {
          if (phoneErr) phoneErr.textContent = "Ingresa un teléfono válido de al menos 9 dígitos.";
          ok = false;
        }
        if (ok) goToStep(2);
      });
    }

    document.querySelectorAll('input[name="delivery-type"]').forEach((r) => {
      r.addEventListener("change", () => {
        const grp = document.getElementById("delivery-address-group");
        if (grp) grp.style.display = r.value === "delivery" ? "block" : "none";
      });
    });

    document.getElementById("back-to-1")?.addEventListener("click", () => goToStep(1));

    document.getElementById("to-step-3")?.addEventListener("click", () => {
      const checked = document.querySelector('input[name="delivery-type"]:checked');
      const addrInput = document.getElementById("delivery-address");
      const addrErr = document.getElementById("address-error");
      if (addrErr) addrErr.textContent = "";
      if (checked && checked.value === "delivery" && (addrInput?.value || "").trim().length < 5) {
        if (addrErr) addrErr.textContent = "Ingresa una dirección de entrega para el delivery.";
        return;
      }
      goToStep(3);
    });

    document.querySelectorAll('input[name="pay-method"]').forEach((r) => {
      r.addEventListener("change", renderPaymentDetail);
    });

    document.getElementById("back-to-2")?.addEventListener("click", () => goToStep(2));
    document.getElementById("to-step-4")?.addEventListener("click", () => goToStep(4));
    document.getElementById("back-to-3")?.addEventListener("click", () => goToStep(3));

    document.getElementById("btn-pagar-simulado")?.addEventListener("click", () => {
      const code = "LALOS-SIM-" + Math.floor(100000 + Math.random() * 900000);
      if (orderResultBox) {
        orderResultBox.style.display = "block";
        orderResultBox.innerHTML = `
          <strong>¡Orden simulada generada!</strong><br />
          Código de orden de ejemplo: <strong>${code}</strong><br />
          <span>Recordatorio: este pago es simulado y no se ha realizado ningún cargo real.</span>
        `;
      }
      if (step4Actions) step4Actions.style.display = "none";
      cart = [];
      persist();
      updateCartUI();
      showToast("Orden " + code + " generada (simulación)");
    });

    // Buscador y categorías
    function syncClearBtn() {
      if (clearSearchBtn && searchInput) {
        clearSearchBtn.style.display = searchInput.value.length > 0 ? "inline-flex" : "none";
      }
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        syncClearBtn();
        renderPanaderia();
        renderCatering();
        searchInput.focus();
      });
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        searchQuery = searchInput.value;
        const win = searchCategory ? searchCategory.value : "panaderia";
        if (win === "panaderia") {
          panFilter = "todos";
          syncPanChips();
        } else {
          catFilter = "todos";
          syncCatChips();
        }
        switchView(win);
      });

      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        syncClearBtn();
        if (currentView === "catering") renderCatering();
        else renderPanaderia();
      });
    }

    if (catToggle && catMenu) {
      catToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        setCategoriesOpen(!catMenu.classList.contains("open"));
      });
    }

    if (catDropdown) {
      catDropdown.addEventListener("mouseenter", () => {
        if (window.innerWidth > 860) setCategoriesOpen(true);
      });
      catDropdown.addEventListener("mouseleave", () => {
        if (window.innerWidth > 860) setCategoriesOpen(false);
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeQtyModal();
        closeCartDrawer();
        closeCheckoutModal();
        setCategoriesOpen(false);
      }
    });

    if (qtyBackdrop) {
      qtyBackdrop.addEventListener("click", (e) => {
        if (e.target === qtyBackdrop) closeQtyModal();
      });
    }
    if (checkoutBackdrop) {
      checkoutBackdrop.addEventListener("click", (e) => {
        if (e.target === checkoutBackdrop) closeCheckoutModal();
      });
    }
    if (cartDrawerBackdrop) {
      cartDrawerBackdrop.addEventListener("click", (e) => {
        if (e.target === cartDrawerBackdrop) closeCartDrawer();
      });
    }

    updateFavBadge();
    renderPanaderia();
    renderCatering();
    updateCartUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();