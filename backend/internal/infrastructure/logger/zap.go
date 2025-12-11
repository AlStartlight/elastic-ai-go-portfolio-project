package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type zapLogger struct {
	logger *zap.Logger
}

// NewZapLogger creates a new zap logger instance
func NewZapLogger() Logger {
	config := zap.NewProductionEncoderConfig()
	config.EncodeTime = zapcore.ISO8601TimeEncoder
	config.EncodeLevel = zapcore.CapitalLevelEncoder

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(config),
		zapcore.AddSync(os.Stdout),
		zapcore.InfoLevel,
	)

	logger := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
	return &zapLogger{logger: logger}
}

func (z *zapLogger) Info(msg string, fields ...interface{}) {
	z.logger.Sugar().Infow(msg, fields...)
}

func (z *zapLogger) Error(msg string, err error, fields ...interface{}) {
	allFields := append([]interface{}{"error", err}, fields...)
	z.logger.Sugar().Errorw(msg, allFields...)
}

func (z *zapLogger) Warn(msg string, fields ...interface{}) {
	z.logger.Sugar().Warnw(msg, fields...)
}

func (z *zapLogger) Debug(msg string, fields ...interface{}) {
	z.logger.Sugar().Debugw(msg, fields...)
}

func (z *zapLogger) Fatal(msg string, err error, fields ...interface{}) {
	allFields := append([]interface{}{"error", err}, fields...)
	z.logger.Sugar().Fatalw(msg, allFields...)
}

func (z *zapLogger) Sync() error {
	return z.logger.Sync()
}
