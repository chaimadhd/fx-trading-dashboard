import { useEffect, useMemo, useState } from "react";
import "./App.css";

type MarketPrice = {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
};

type Order = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: "NEW" | "FILLED" | "CANCELLED";
  createdAt: string;
};

type Portfolio = {
  buyValue: number;
  sellValue: number;
  netPosition: number;
  realizedPnl: number;
  totalOrders: number;
};

type PricePoint = {
  time: string;
  value: number;
};

const ORDERS_PER_PAGE = 5;

function App() {
  const [market, setMarket] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const [symbol, setSymbol] = useState("EUR/USD");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("10000");

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const [timeSort, setTimeSort] = useState<"asc" | "desc">("desc");

  const [pairFilter, setPairFilter] = useState("ALL");
  const [sideFilter, setSideFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedChartSymbol, setSelectedChartSymbol] =
    useState("EUR/USD");

  const [priceHistory, setPriceHistory] = useState<
    Record<string, PricePoint[]>
  >({});

  useEffect(() => {
    const loadMarket = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/market");
        const data = await response.json();

        setMarket(data);
        setLoading(false);

        const now = new Date();

        const initialHistory: Record<string, PricePoint[]> = {};

        data.forEach((price: MarketPrice) => {
          initialHistory[price.symbol] = [
            {
              time: now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              value: price.bid,
            },
          ];
        });

        setPriceHistory(initialHistory);
      } catch (error) {
        console.error("Failed to load market data:", error);
        setLoading(false);
      }
    };

    loadMarket();

    const interval = setInterval(() => {
      setMarket((currentMarket) =>
        currentMarket.map((price) => {
          const volatility =
            price.symbol === "USD/JPY" ? 0.02 : 0.0002;

          const movement =
            (Math.random() - 0.5) * volatility;

          const bid = price.bid + movement;
          const ask = price.ask + movement;

          return {
            ...price,
            bid: Number(
              bid.toFixed(
                price.symbol === "USD/JPY" ? 2 : 4,
              ),
            ),
            ask: Number(
              ask.toFixed(
                price.symbol === "USD/JPY" ? 2 : 4,
              ),
            ),
            spread: Number(
              (ask - bid).toFixed(
                price.symbol === "USD/JPY" ? 2 : 4,
              ),
            ),
          };
        }),
      );
    }, 3000);

    fetch("http://localhost:8080/api/orders")
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error("Failed to load order history:", error);
      });

    fetch("http://localhost:8080/api/portfolio")
      .then((response) => response.json())
      .then((data) => {
        setPortfolio(data);
      })
      .catch((error) => {
        console.error("Failed to load portfolio data:", error);
      });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (market.length === 0) {
      return;
    }

    const now = new Date();

    setPriceHistory((currentHistory) => {
      const nextHistory = { ...currentHistory };

      market.forEach((price) => {
        const existing = nextHistory[price.symbol] ?? [];

        const nextPoint: PricePoint = {
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          value: price.bid,
        };

        nextHistory[price.symbol] = [
          ...existing,
          nextPoint,
        ].slice(-30);
      });

      return nextHistory;
    });
  }, [market]);

  const handleSubmitOrder = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setOrderError("");
    setOrder(null);

    try {
      const response = await fetch(
        "http://localhost:8080/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol,
            side,
            quantity: Number(quantity),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create order",
        );
      }

      setOrder(data);
      setOrders((currentOrders) => [
        data,
        ...currentOrders,
      ]);

      setCurrentPage(1);

      const portfolioResponse = await fetch(
        "http://localhost:8080/api/portfolio",
      );

      if (portfolioResponse.ok) {
        const portfolioData =
          await portfolioResponse.json();

        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error(
        "Failed to create order:",
        error,
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : "Failed to create order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (
    orderId: string,
  ) => {
    try {
      setOrderError("");

      const response = await fetch(
        `http://localhost:8080/api/orders/${orderId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to cancel order",
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === orderId ? data : item,
        ),
      );

      if (order?.id === orderId) {
        setOrder(data);
      }

      const portfolioResponse = await fetch(
        "http://localhost:8080/api/portfolio",
      );

      if (portfolioResponse.ok) {
        const portfolioData =
          await portfolioResponse.json();

        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error(
        "Failed to cancel order:",
        error,
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : "Failed to cancel order",
      );
    }
  };

  const handleFillOrder = async (
    orderId: string,
  ) => {
    try {
      setOrderError("");

      const response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/fill`,
        {
          method: "PUT",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fill order",
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === orderId ? data : item,
        ),
      );

      if (order?.id === orderId) {
        setOrder(data);
      }

      const portfolioResponse = await fetch(
        "http://localhost:8080/api/portfolio",
      );

      if (portfolioResponse.ok) {
        const portfolioData =
          await portfolioResponse.json();

        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error(
        "Failed to fill order:",
        error,
      );

      setOrderError(
        error instanceof Error
          ? error.message
          : "Failed to fill order",
      );
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    return [...orders]
      .filter((item) => {
        const matchesPair =
          pairFilter === "ALL" ||
          item.symbol === pairFilter;

        const matchesSide =
          sideFilter === "ALL" ||
          item.side === sideFilter;

        const matchesStatus =
          statusFilter === "ALL" ||
          item.status === statusFilter;

        return (
          matchesPair &&
          matchesSide &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        const timeA = new Date(
          a.createdAt,
        ).getTime();

        const timeB = new Date(
          b.createdAt,
        ).getTime();

        return timeSort === "asc"
          ? timeA - timeB
          : timeB - timeA;
      });
  }, [
    orders,
    pairFilter,
    sideFilter,
    statusFilter,
    timeSort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAndSortedOrders.length /
        ORDERS_PER_PAGE,
    ),
  );

  const paginatedOrders =
    filteredAndSortedOrders.slice(
      (currentPage - 1) *
        ORDERS_PER_PAGE,
      currentPage * ORDERS_PER_PAGE,
    );

  const resetFilters = () => {
    setPairFilter("ALL");
    setSideFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const handlePairFilter = (
    value: string,
  ) => {
    setPairFilter(value);
    setCurrentPage(1);
  };

  const handleSideFilter = (
    value: string,
  ) => {
    setSideFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (
    value: string,
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const chartData =
    priceHistory[selectedChartSymbol] ?? [];

  const selectedMarketPrice = market.find(
    (price) =>
      price.symbol === selectedChartSymbol,
  );

  const chartValues = chartData.map(
    (point) => point.value,
  );

  const chartMin =
    chartValues.length > 0
      ? Math.min(...chartValues)
      : 0;

  const chartMax =
    chartValues.length > 0
      ? Math.max(...chartValues)
      : 1;

  const chartRange =
    chartMax - chartMin || 0.0001;

  const chartWidth = 900;
  const chartHeight = 280;
  const chartPadding = 28;

  const chartPoints = chartData.map(
    (point, index) => {
      const x =
        chartData.length <= 1
          ? chartWidth / 2
          : chartPadding +
            (index /
              (chartData.length - 1)) *
              (chartWidth -
                chartPadding * 2);

      const y =
        chartHeight -
        chartPadding -
        ((point.value - chartMin) /
          chartRange) *
          (chartHeight -
            chartPadding * 2);

      return {
        x,
        y,
        value: point.value,
      };
    },
  );

  const chartPath = chartPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>FX Trading Dashboard</h1>
          <p>Market overview</p>
        </div>

        <div className="status">
          <span className="status-dot" />
          Market connected
        </div>
      </header>

      <main>
        <section className="market-section">
          <div className="section-header">
            <h2>Market prices</h2>
            <span>Live API</span>
          </div>

          {loading ? (
            <p className="loading">
              Loading market data...
            </p>
          ) : (
            <div className="market-grid">
              {market.map((price) => (
                <div
                  className="market-card"
                  key={price.symbol}
                >
                  <div className="symbol">
                    {price.symbol}
                  </div>

                  <div className="prices">
                    <div>
                      <span>Bid</span>
                      <strong>
                        {price.bid}
                      </strong>
                    </div>

                    <div>
                      <span>Ask</span>
                      <strong>
                        {price.ask}
                      </strong>
                    </div>
                  </div>

                  <div className="spread">
                    Spread: {price.spread}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="chart-section">
          <div className="section-header">
            <h2>Price movement</h2>
            <span>Live simulation</span>
          </div>

          <div className="chart-card">
            <div className="chart-toolbar">
              <div className="chart-pairs">
                {market.map((price) => (
                  <button
                    key={price.symbol}
                    type="button"
                    className={
                      selectedChartSymbol ===
                      price.symbol
                        ? "chart-pair active"
                        : "chart-pair"
                    }
                    onClick={() =>
                      setSelectedChartSymbol(
                        price.symbol,
                      )
                    }
                  >
                    {price.symbol}
                  </button>
                ))}
              </div>

              {selectedMarketPrice && (
                <div className="chart-current-price">
                  <span>
                    {selectedMarketPrice.symbol}
                  </span>

                  <strong>
                    {selectedMarketPrice.bid}
                  </strong>
                </div>
              )}
            </div>

            <div className="chart">
              {chartData.length > 1 ? (
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                >
                  <line
                    x1={chartPadding}
                    y1={
                      chartHeight -
                      chartPadding
                    }
                    x2={
                      chartWidth -
                      chartPadding
                    }
                    y2={
                      chartHeight -
                      chartPadding
                    }
                    className="chart-grid-line"
                  />

                  <line
                    x1={chartPadding}
                    y1={chartPadding}
                    x2={
                      chartWidth -
                      chartPadding
                    }
                    y2={chartPadding}
                    className="chart-grid-line"
                  />

                  <line
                    x1={chartPadding}
                    y1={
                      chartHeight / 2
                    }
                    x2={
                      chartWidth -
                      chartPadding
                    }
                    y2={
                      chartHeight / 2
                    }
                    className="chart-grid-line"
                  />

                  <path
                    d={chartPath}
                    className="price-line"
                  />

                  {chartPoints.map(
                    (point, index) =>
                      index ===
                      chartPoints.length -
                        1 && (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          className="chart-point"
                        />
                      ),
                  )}
                </svg>
              ) : (
                <div className="chart-empty">
                  Collecting price data...
                </div>
              )}
            </div>

            <div className="chart-footer">
              <span>
                Low{" "}
                {chartValues.length
                  ? chartMin
                  : "-"}
              </span>

              <span>
                {chartData.length} data
                points
              </span>

              <span>
                High{" "}
                {chartValues.length
                  ? chartMax
                  : "-"}
              </span>
            </div>
          </div>
        </section>

        <section className="portfolio-section">
          <div className="section-header">
            <h2>Portfolio</h2>
            <span>Trading summary</span>
          </div>

          {portfolio ? (
            <div className="portfolio-grid">
              <div className="portfolio-card">
                <span>Buy value</span>
                <strong>
                  {portfolio.buyValue.toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div className="portfolio-card">
                <span>Sell value</span>
                <strong>
                  {portfolio.sellValue.toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div className="portfolio-card">
                <span>Realized P&amp;L</span>

                <strong
                  className={
                    portfolio.realizedPnl >= 0
                      ? "buy-text"
                      : "sell-text"
                  }
                >
                  {portfolio.realizedPnl >=
                  0
                    ? "+"
                    : ""}
                  {portfolio.realizedPnl.toFixed(
                    4,
                  )}
                </strong>
              </div>

              <div className="portfolio-card">
                <span>Net position</span>
                <strong>
                  {portfolio.netPosition.toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div className="portfolio-card">
                <span>Total orders</span>
                <strong>
                  {portfolio.totalOrders}
                </strong>
              </div>
            </div>
          ) : (
            <p className="loading">
              Loading portfolio...
            </p>
          )}
        </section>

        <section className="order-section">
          <div className="section-header">
            <h2>Order ticket</h2>
            <span>Execute trade</span>
          </div>

          <form
            className="order-ticket"
            onSubmit={handleSubmitOrder}
          >
            <div className="form-group">
              <label htmlFor="symbol">
                Currency pair
              </label>

              <select
                id="symbol"
                value={symbol}
                onChange={(event) =>
                  setSymbol(event.target.value)
                }
              >
                {market.map((price) => (
                  <option
                    key={price.symbol}
                    value={price.symbol}
                  >
                    {price.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Side</label>

              <div className="side-buttons">
                <button
                  type="button"
                  className={
                    side === "BUY"
                      ? "side-button active"
                      : "side-button"
                  }
                  onClick={() =>
                    setSide("BUY")
                  }
                >
                  BUY
                </button>

                <button
                  type="button"
                  className={
                    side === "SELL"
                      ? "side-button active"
                      : "side-button"
                  }
                  onClick={() =>
                    setSide("SELL")
                  }
                >
                  SELL
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </div>

            <button
              className="execute-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Executing..."
                : `Execute ${side}`}
            </button>
          </form>

          {order && (
            <div className="order-result">
              <div className="order-result-header">
                <strong>
                  {order.status ===
                  "CANCELLED"
                    ? "Order cancelled"
                    : "Order executed"}
                </strong>

                <span>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div>
                  <span>Pair</span>
                  <strong>
                    {order.symbol}
                  </strong>
                </div>

                <div>
                  <span>Side</span>
                  <strong>
                    {order.side}
                  </strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong>
                    {order.quantity}
                  </strong>
                </div>

                <div>
                  <span>Price</span>
                  <strong>
                    {order.price}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {orderError && (
            <div className="order-error">
              {orderError}
            </div>
          )}

          <section className="history-section">
            <div className="section-header">
              <h2>Order history</h2>

              <span>
                {filteredAndSortedOrders.length}{" "}
                of {orders.length} orders
              </span>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label htmlFor="pair-filter">
                  Pair
                </label>

                <select
                  id="pair-filter"
                  value={pairFilter}
                  onChange={(event) =>
                    handlePairFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="ALL">
                    All pairs
                  </option>

                  {market.map((price) => (
                    <option
                      key={price.symbol}
                      value={price.symbol}
                    >
                      {price.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="side-filter">
                  Side
                </label>

                <select
                  id="side-filter"
                  value={sideFilter}
                  onChange={(event) =>
                    handleSideFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="ALL">
                    All sides
                  </option>
                  <option value="BUY">
                    BUY
                  </option>
                  <option value="SELL">
                    SELL
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="status-filter">
                  Status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="ALL">
                    All statuses
                  </option>
                  <option value="NEW">
                    NEW
                  </option>
                  <option value="FILLED">
                    FILLED
                  </option>
                  <option value="CANCELLED">
                    CANCELLED
                  </option>
                </select>
              </div>

              <button
                type="button"
                className="reset-filter-button"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>

            {filteredAndSortedOrders.length ===
            0 ? (
              <div className="empty-orders">
                <strong>
                  No matching orders
                </strong>
                <span>
                  Try changing your filters.
                </span>
              </div>
            ) : (
              <>
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th className="col-pair">
                          PAIR
                        </th>

                        <th className="col-side">
                          SIDE
                        </th>

                        <th className="col-quantity">
                          QUANTITY
                        </th>

                        <th className="col-price">
                          PRICE
                        </th>

                        <th className="col-status">
                          STATUS
                        </th>

                        <th className="col-time">
                          <button
                            type="button"
                            className="time-sort-button"
                            onClick={() =>
                              setTimeSort(
                                (current) =>
                                  current ===
                                  "desc"
                                    ? "asc"
                                    : "desc",
                              )
                            }
                          >
                            <span>TIME</span>

                            <span className="sort-arrow">
                              {timeSort ===
                              "desc"
                                ? "↓"
                                : "↑"}
                            </span>
                          </button>
                        </th>

                        <th className="col-action">
                          ACTION
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedOrders.map(
                        (item) => (
                          <tr key={item.id}>
                            <td className="col-pair">
                              {item.symbol}
                            </td>

                            <td
                              className={`col-side ${
                                item.side ===
                                "BUY"
                                  ? "buy-text"
                                  : "sell-text"
                              }`}
                            >
                              {item.side}
                            </td>

                            <td className="col-quantity">
                              {item.quantity}
                            </td>

                            <td className="col-price">
                              {item.price}
                            </td>

                            <td
                              className={`col-status ${
                                item.status ===
                                "NEW"
                                  ? "status-new"
                                  : item.status ===
                                      "FILLED"
                                    ? "status-filled"
                                    : "status-cancelled"
                              }`}
                            >
                              {item.status}
                            </td>

                            <td className="col-time">
                              {new Date(
                                item.createdAt,
                              ).toLocaleString()}
                            </td>

                            <td className="col-action">
                              {item.status ===
                                "NEW" && (
                                <div className="order-actions">
                                  <button
                                    type="button"
                                    className="fill-button"
                                    onClick={() =>
                                      handleFillOrder(
                                        item.id,
                                      )
                                    }
                                  >
                                    Fill
                                  </button>

                                  <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                      handleCancelOrder(
                                        item.id,
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1,
                          ),
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={
                          currentPage === page
                            ? "page-button active"
                            : "page-button"
                        }
                        onClick={() =>
                          setCurrentPage(page)
                        }
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            totalPages,
                            page + 1,
                          ),
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;