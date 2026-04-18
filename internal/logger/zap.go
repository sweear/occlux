package logger

import "go.uber.org/zap"

type zapLogger struct {
	l *zap.Logger
}

func NewZapLogger() Logger {
	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}

	return &zapLogger{
		l: logger.WithOptions(zap.AddCallerSkip(2)),
	}
}

func (z *zapLogger) Info(msg string, args ...any) {
	z.l.Info(msg, toFields(args)...)
}

func (z *zapLogger) Warn(msg string, args ...any) {
	z.l.Warn(msg, toFields(args)...)
}

func (z *zapLogger) Error(msg string, args ...any) {
	z.l.Error(msg, toFields(args)...)
}

func (z *zapLogger) Fatal(msg string, args ...any) {
	z.l.Fatal(msg, toFields(args)...)
}

func (z *zapLogger) With(args ...any) Logger {
	return &zapLogger{
		l: z.l.With(toFields(args)...),
	}
}

func (z *zapLogger) Sync() {
	_ = z.l.Sync()
}

func toFields(args []any) []zap.Field {
	fields := make([]zap.Field, 0, len(args)/2)
	for i := 0; i+1 < len(args); i += 2 {
		key, ok := args[i].(string)
		if !ok {
			continue
		}
		fields = append(fields, zap.Any(key, args[i+1]))
	}
	return fields
}
