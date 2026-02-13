package middleware

import (
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	registerMetricsOnce sync.Once

	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests.",
		},
		[]string{"method", "path", "status"},
	)
	httpRequestDurationSeconds = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)
	httpRequestsInFlight = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "http_requests_in_flight",
			Help: "Current number of in-flight HTTP requests.",
		},
	)
)

// MetricsMiddleware records basic Prometheus metrics for HTTP requests.
func MetricsMiddleware() gin.HandlerFunc {
	registerMetricsOnce.Do(func() {
		prometheus.MustRegister(httpRequestsTotal, httpRequestDurationSeconds, httpRequestsInFlight)
	})

	return func(c *gin.Context) {
		start := time.Now()
		httpRequestsInFlight.Inc()

		c.Next()

		status := c.Writer.Status()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		if path == "" {
			path = "unknown"
		}

		labels := prometheus.Labels{
			"method": c.Request.Method,
			"path":   path,
			"status": strconv.Itoa(status),
		}
		httpRequestsTotal.With(labels).Inc()
		httpRequestDurationSeconds.With(labels).Observe(time.Since(start).Seconds())
		httpRequestsInFlight.Dec()
	}
}
