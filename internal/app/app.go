package app

type Runnable interface {
	Run() error
	Stop() error
}

type App struct {
	components []Runnable
}