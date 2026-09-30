const ToyHaven = (() => {

    const KEYS = {

        cart: "toyHavenCart",

        wishlist: "toyHavenWishlist",

        newsletter: "toyHavenNewsletter",

        feedback: "toyHavenFeedback",

        orders: "toyHavenOrders"

    };

    function read(key, fallback) {

        try {

            const value =
                localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : fallback;

        } catch {

            return fallback;

        }

    }


    function write(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    function formatMoney(amount) {

        return "LKR " +
            Number(amount).toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }

    function getProduct(id) {

        return TOY_PRODUCTS.find(
            product => product.id === id
        );

    }


    function getProductOfTheDay() {

        if (!TOY_PRODUCTS.length) {
            return null;
        }

        const day =
            Math.floor(
                Date.now() /
                86400000
            );

        return TOY_PRODUCTS[
            day % TOY_PRODUCTS.length
        ];

    }

    function getCart() {

        return read(
            KEYS.cart,
            []
        );

    }


    function addToCart(id) {

        const cart =
            getCart();

        const existing =
            cart.find(
                item => item.id === id
            );


        if (existing) {

            existing.quantity++;

        } else {

            cart.push({

                id: id,

                quantity: 1

            });

        }


        write(
            KEYS.cart,
            cart
        );


        updateCartBadge();

        showToast(
            "Added to cart ✨"
        );

    }


    function changeQuantity(id, action) {

        const cart =
            getCart();

        const item =
            cart.find(
                product => product.id === id
            );


        if (!item) return;


        if (action === "increase") {

            item.quantity++;

        }


        if (action === "decrease") {

            item.quantity--;

        }


        const newCart =
            cart.filter(
                item => item.quantity > 0
            );


        write(
            KEYS.cart,
            newCart
        );


        updateCartBadge();

    }


    function updateCartBadge() {

        const cart =
            getCart();

        const total =
            cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );


        document.querySelectorAll(
            ".cart-badge"
        ).forEach(
            badge =>
                badge.textContent = total
        );

    }

    function getWishlist() {

        return read(
            KEYS.wishlist,
            {}
        );

    }


    function addToWishlist(id) {

        const wishlist =
            getWishlist();

        wishlist[id] =
            "Interested";


        write(
            KEYS.wishlist,
            wishlist
        );


        showToast(
            "Added to your collection 💖"
        );

    }


    function setWishlistStatus(
        id,
        status
    ) {

        const wishlist =
            getWishlist();

        wishlist[id] =
            status;


        write(
            KEYS.wishlist,
            wishlist
        );


        showToast(
            status + " saved"
        );

    }


    function removeFromWishlist(id) {

        const wishlist =
            getWishlist();

        delete wishlist[id];


        write(
            KEYS.wishlist,
            wishlist
        );


        showToast(
            "Removed from collection"
        );

    }

    function renderProducts(
        target,
        options = {}
    ) {

        const container =
            document.querySelector(target);

        if (!container) return;


        const category =
            options.category || "All";

        const search =
            (options.search || "")
            .toLowerCase();

        const limit =
            options.limit || TOY_PRODUCTS.length;


        let products =
            TOY_PRODUCTS.filter(
                product => {

                    const matchesCategory =
                        category === "All" ||
                        product.category === category;

                    const matchesSearch =
                        product.name
                            .toLowerCase()
                            .includes(search);

                    return (
                        matchesCategory &&
                        matchesSearch
                    );

                }
            );


        products =
            products.slice(0, limit);


        if (products.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        🔍
                    </div>

                    <h3>
                        No products found
                    </h3>

                    <p>
                        Try another search or category.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            products.map(
                createProductCard
            ).join("");


        container
            .querySelectorAll(".add-cart")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        addToCart(
                            button.dataset.id
                        );

                    }
                );

            });


        container
            .querySelectorAll(".add-wishlist")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        addToWishlist(
                            button.dataset.id
                        );

                    }
                );

            });


        container
            .querySelectorAll(".view-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openProductModal(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    function createProductCard(product) {

        return `

            <article class="product-card">

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy">

                </div>


                <div class="product-content">

                    <div class="product-top">

                        <span class="product-badge">
                            ${product.badge}
                        </span>

                        <span class="category-text">
                            ${product.category}
                        </span>

                    </div>


                    <h3>
                        ${product.name}
                    </h3>


                    <div class="rating">
                        ★★★★★
                        <span>
                            ${product.rating}
                        </span>
                    </div>


                    <div class="product-price">
                        ${formatMoney(product.price)}
                    </div>


                    <div class="card-actions">

                        <button
                            class="button button-primary add-cart"
                            data-id="${product.id}">

                            Add to Cart

                        </button>


                        <button
                            class="icon-button view-product"
                            data-id="${product.id}"
                            aria-label="View product">

                            ↗

                        </button>


                        <button
                            class="icon-button add-wishlist"
                            data-id="${product.id}"
                            aria-label="Add to wishlist">

                            ♡

                        </button>

                    </div>

                </div>

            </article>

        `;

    }

    function openProductModal(id) {

        const product =
            getProduct(id);

        const modal =
            document.getElementById(
                "productModal"
            );

        const content =
            document.getElementById(
                "modalContent"
            );


        if (!product || !modal) return;


        content.innerHTML = `

            <div class="modal-grid">

                <div class="modal-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}">

                </div>


                <div class="modal-details">

                    <span class="product-badge">
                        ${product.badge}
                    </span>

                    <span class="category-text">
                        ${product.category}
                    </span>

                    <h2>
                        ${product.name}
                    </h2>

                    <div class="rating">
                        ★★★★★ ${product.rating}
                    </div>

                    <p>
                        ${product.description}
                    </p>

                    <div class="large-price">
                        ${formatMoney(product.price)}
                    </div>

                    <div class="card-actions">

                        <button
                            class="button button-primary"
                            id="modalAddCart">

                            Add to Cart

                        </button>

                        <button
                            class="button button-outline"
                            id="modalWishlist">

                            ♡ Wishlist

                        </button>

                    </div>

                </div>

            </div>

        `;


        modal.classList.add("show");


        document.getElementById(
            "modalAddCart"
        ).onclick = function () {

            addToCart(product.id);

        };


        document.getElementById(
            "modalWishlist"
        ).onclick = function () {

            addToWishlist(product.id);

        };

    }

    function showToast(message) {

        const toast =
            document.getElementById(
                "toast"
            );

        if (!toast) return;


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            2500
        );

    }

    function setupNavigation() {

        const button =
            document.getElementById(
                "menuButton"
            );

        const navigation =
            document.getElementById(
                "navigation"
            );


        if (button) {

            button.addEventListener(
                "click",
                function () {

                    navigation.classList.toggle(
                        "open"
                    );

                }
            );

        }

    }

    function setupNewsletter() {

        document.querySelectorAll(
            ".newsletter-form"
        ).forEach(
            form => {

                form.addEventListener(
                    "submit",
                    function (event) {

                        event.preventDefault();


                        const email =
                            form.email.value.trim();


                        if (
                            !/^\S+@\S+\.\S+$/
                                .test(email)
                        ) {

                            showToast(
                                "Please enter a valid email."
                            );

                            return;

                        }


                        write(
                            KEYS.newsletter,
                            {
                                email: email,
                                joined:
                                    new Date()
                                        .toISOString()
                            }
                        );


                        form.reset();


                        showToast(
                            "Welcome to Toy Haven Club! 💌"
                        );

                    }
                );

            }
        );

    }

    function setupModal() {

        const modal =
            document.getElementById(
                "productModal"
            );

        const close =
            document.getElementById(
                "modalClose"
            );


        if (!modal) return;


        close?.addEventListener(
            "click",
            () =>
                modal.classList.remove(
                    "show"
                )
        );


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setupNavigation();

            setupNewsletter();

            setupModal();

            updateCartBadge();

        }
    );


    return {

        KEYS,

        read,

        write,

        formatMoney,

        getProduct,

        getProductOfTheDay,

        getCart,

        addToCart,

        changeQuantity,

        updateCartBadge,

        getWishlist,

        addToWishlist,

        setWishlistStatus,

        removeFromWishlist,

        renderProducts,

        showToast

    };

})();

// ---------- PWA: register the service worker (makes the site installable/offline) ----------
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js");
    });
}
