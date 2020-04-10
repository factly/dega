package logger

import (
	"fmt"
	"log"
	"runtime"
	"strings"
)

// Debug printer
func Debug(m ...interface{}) string {
	programCounter, file, _, _ := runtime.Caller(1)
	fn := strings.Split(runtime.FuncForPC(programCounter).Name(), ".")
	msg := fmt.Sprintf("[DEBUG] [file:%s function:%s] %s", file, fn[len(fn)-1], m)
	log.Println(msg)
	return msg
}

// Error printer
func Error(e error) string {
	programCounter, file, _, _ := runtime.Caller(1)
	fn := strings.Split(runtime.FuncForPC(programCounter).Name(), ".")
	msg := fmt.Sprintf("[ERROR] [file:%s function:%s] %s", file, fn[len(fn)-1], e)
	log.Println(msg)
	return msg
}
