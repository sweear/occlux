package logger

type Logger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
	With(args ...any) Logger
	Sync()
}

var globalLogger Logger

func Init() {
	globalLogger = NewZapLogger()
}

func Info(msg string, args ...any) {
	globalLogger.Info(msg, args...)
}

func Warn(msg string, args ...any) {
	globalLogger.Warn(msg, args...)
}

func Error(msg string, args ...any) {
	globalLogger.Error(msg, args...)
}

func With(args ...any) Logger {
	return globalLogger.With(args...)
}

func Sync() {
	globalLogger.Sync()
}
