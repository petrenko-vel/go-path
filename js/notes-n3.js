// Конспекты: errors.Is/As, defer/panic/recover, пакеты. «§» в коде означает обратную кавычку.
mergeNotes({
"s3-3":{b:[
 ['p',`Когда ошибки заворачивают в контекст через <code>%w</code>, сравнивать их через <code>==</code> уже нельзя: перед тобой не сама ошибка, а цепочка. Для этого есть <code>errors.Is</code> (<b>«есть ли в цепочке вот эта ошибка?»</b>) и <code>errors.As</code> (<b>«есть ли в цепочке ошибка такого типа, и дай мне её»</b>). Плюс собственные типы ошибок, которые несут поля: код, поле формы, текст.`],
 ['real',5,'каждый день',[
  '<b>Сопоставление ошибки и HTTP-статуса:</b> «не найдено» превращается в 404, «нет доступа» в 403, всё остальное в 500. Делают в одном месте для всего API.',
  '<b>Ошибки валидации</b> с полем и текстом, чтобы вернуть клиенту, какое поле неверно.',
  '<b>Ветвление по причине:</b> <code>sql.ErrNoRows</code> значит «создать», сетевая ошибка значит «повторить».',
  '<b>Собеседования:</b> разница между <code>Is</code> и <code>As</code> и «почему не <code>==</code>» спрашивают очень часто.']],
 ['h','1. errors.Is: сравнение по значению'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound  = errors.New("не найдено")
	ErrForbidden = errors.New("нет доступа")
)

func repoGet(id int) error {
	switch id {
	case 1:
		return nil
	case 2:
		return fmt.Errorf("пользователь %d: %w", id, ErrNotFound)
	default:
		return errors.New("соединение с базой потеряно")
	}
}

func serviceGet(id int) error {
	if err := repoGet(id); err != nil {
		return fmt.Errorf("serviceGet: %w", err) // добавили контекст, цепочка сохранилась
	}
	return nil
}

func main() {
	for _, id := range []int{1, 2, 3} {
		err := serviceGet(id)
		switch {
		case err == nil:
			fmt.Println(id, "ок")
		case errors.Is(err, ErrNotFound):
			fmt.Println(id, "404:", err)
		case errors.Is(err, ErrForbidden):
			fmt.Println(id, "403:", err)
		default:
			fmt.Println(id, "500:", err)
		}
	}
}`],
 ['out',`1 ок
2 404: serviceGet: пользователь 2: не найдено
3 500: serviceGet: соединение с базой потеряно`],
 ['ul',[
  '<code>errors.Is(err, target)</code> идёт по цепочке (<code>%w</code>) и сравнивает каждое звено с <code>target</code>.',
  'Сравнение <code>err == ErrNotFound</code> сработало бы только для «голой» ошибки. После <code>fmt.Errorf("...: %w", err)</code> оно вернёт false: ' + A('https://100go.co/#comparing-an-error-value-inaccurately-51','100 Go Mistakes №51') + '.',
  'Порядок веток в <code>switch</code> важен: первая подошедшая выигрывает.']],
 ['h','2. errors.As: достать ошибку нужного типа'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

type ValidationError struct {
	Field string
	Msg   string
}

func (e *ValidationError) Error() string { return e.Field + ": " + e.Msg }

func createUser(name string, age int) error {
	if name == "" {
		return &ValidationError{"name", "обязательное поле"}
	}
	if age < 18 {
		return fmt.Errorf("создание пользователя: %w", &ValidationError{"age", "нужно 18 или больше"})
	}
	return nil
}

func main() {
	for _, c := range []struct {
		name string
		age  int
	}{{"Аня", 30}, {"", 20}, {"Боря", 15}} {
		err := createUser(c.name, c.age)
		var ve *ValidationError
		if errors.As(err, &ve) {
			fmt.Printf("поле %q: %s | вся ошибка: %v\\n", ve.Field, ve.Msg, err)
		} else {
			fmt.Println("ошибки валидации нет:", err)
		}
	}
}`],
 ['out',`ошибки валидации нет: <nil>
поле "name": обязательное поле | вся ошибка: name: обязательное поле
поле "age": нужно 18 или больше | вся ошибка: создание пользователя: age: нужно 18 или больше`],
 ['ul',[
  '<code>errors.As(err, &target)</code> ищет в цепочке ошибку, <b>присваиваемую</b> типу <code>target</code>, и записывает её туда. Вторым аргументом всегда <b>указатель на переменную</b> (поэтому <code>&amp;ve</code>).',
  'Переменную объявляют с тем типом, которым ошибка реально является: <code>*ValidationError</code>, если метод <code>Error</code> у указателя.',
  '<code>Is</code> нужен, когда есть конкретное значение (<code>ErrNotFound</code>), <code>As</code>, когда нужен тип и его поля.']],
 ['warn','Если <code>target</code> не указатель на тип, реализующий <code>error</code>, или не указатель на интерфейс, <code>errors.As</code> устроит <b>панику</b>. Типичная причина: объявили <code>var ve ValidationError</code> (значение), хотя ошибка у указателя. Вывод такой программы: <code>panic: errors: *target must be interface or implement error</code>. Проверку делает команда <code>go vet</code>: запускай её.'],
 ['h','3. Свой метод Is'],
 ['code',`package main

import (
	"errors"
	"fmt"
	"net/http"
)

type HTTPError struct {
	Code int
	Text string
}

func (e *HTTPError) Error() string { return fmt.Sprintf("%d %s", e.Code, e.Text) }

// Is сравнивает только код: HTTPError{Code: 404} совпадёт с любой 404
func (e *HTTPError) Is(target error) bool {
	t, ok := target.(*HTTPError)
	return ok && t.Code == e.Code
}

var ErrNotFound = &HTTPError{Code: http.StatusNotFound}

func get(path string) error {
	if path == "/missing" {
		return fmt.Errorf("get %s: %w", path, &HTTPError{404, "страница пропала"})
	}
	return nil
}

func main() {
	err := get("/missing")
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNotFound))
	fmt.Println(errors.Is(err, &HTTPError{Code: 500}))
}`],
 ['out',`get /missing: 404 страница пропала
true
false`],
 ['p','По умолчанию <code>Is</code> сравнивает значения через <code>==</code>. Если нужно «равенство по смыслу» (одинаковый код при разном тексте), тип добавляет метод <code>Is(target error) bool</code>, и <code>errors.Is</code> вызывает его на каждом звене.'],
 ['case','Единое место, где ошибка превращается в HTTP-статус',[
  '<p>В хорошем API <b>только один слой</b> знает про HTTP: он смотрит на цепочку ошибок и выбирает статус. Репозиторий и сервис про коды ничего не знают, а просто возвращают значимые ошибки:</p>']],
 ['code',`package main

import (
	"errors"
	"fmt"
	"net/http"
)

var (
	ErrNotFound   = errors.New("не найдено")
	ErrForbidden  = errors.New("нет доступа")
	ErrValidation = errors.New("некорректные данные")
)

// statusFor превращает цепочку ошибок в HTTP-статус: единое место для всего API
func statusFor(err error) int {
	switch {
	case err == nil:
		return http.StatusOK
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, ErrValidation):
		return http.StatusUnprocessableEntity
	default:
		return http.StatusInternalServerError
	}
}

func main() {
	errs := []error{
		nil,
		fmt.Errorf("загрузка: %w", ErrNotFound),
		fmt.Errorf("доступ: %w", ErrForbidden),
		fmt.Errorf("форма: %w", fmt.Errorf("возраст: %w", ErrValidation)),
		errors.New("база недоступна"),
	}
	for _, e := range errs {
		fmt.Println(statusFor(e), http.StatusText(statusFor(e)))
	}
}`],
 ['out',`200 OK
404 Not Found
403 Forbidden
422 Unprocessable Entity
500 Internal Server Error`],
 ['p','Неизвестная ошибка всегда превращается в 500, а её текст не показывают клиенту (внутренние детали остаются в логах).'],
 ['h','4. Join и несколько %w'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

var ErrA = errors.New("A")
var ErrB = errors.New("B")

func main() {
	joined := errors.Join(ErrA, ErrB)
	fmt.Println(errors.Is(joined, ErrA), errors.Is(joined, ErrB), errors.Is(joined, errors.New("C")))

	both := fmt.Errorf("две причины: %w и %w", ErrA, ErrB)
	fmt.Println(both)
	fmt.Println(errors.Is(both, ErrA), errors.Is(both, ErrB))

	hidden := fmt.Errorf("внутренняя деталь: %v", ErrA) // %v скрывает ErrA
	fmt.Println(errors.Is(hidden, ErrA))
}`],
 ['out',`true true false
две причины: A и B
true true
false`],
 ['ul',[
  '<code>errors.Join</code> и <code>%w</code> с несколькими ошибками (Go 1.20) строят не цепочку, а дерево: <code>Is</code> и <code>As</code> обходят все ветки.',
  'Намеренно спрятать внутреннюю деталь можно через <code>%v</code>: так утечка реализации (например, ошибки драйвера БД) не станет частью публичного контракта.']],
 ['h','5. Свой тип ошибки: правила'],
 ['ul',[
  'Тип с методом <code>Error() string</code> и нужными полями. Метод обычно у <b>указателя</b>, ошибку создают через <code>&amp;MyErr{...}</code>.',
  'Имя заканчивается на <code>Error</code> (<code>ValidationError</code>), а значения-«ярлыки» начинаются с <code>Err</code> (<code>ErrNotFound</code>).',
  'Хочешь уметь «размотать» цепочку: добавь метод <code>Unwrap() error</code>, возвращающий вложенную ошибку.',
  'Не возвращай nil-указатель своего типа как <code>error</code>: это ловушка из темы про интерфейсы. Возвращай голый <code>nil</code>.',
  'Публичные ошибки пакета (то, с чем сравнивают снаружи) это часть его API: меняя их, ломаешь потребителей.']],
 ['h','6. Is, As или ==?'],
 ['tbl',['Нужно','Используй'],[
  ['Проверить «это та самая известная ошибка» (<code>io.EOF</code>, <code>ErrNotFound</code>)','<code>errors.Is</code>'],
  ['Достать поля ошибки своего типа','<code>errors.As</code>'],
  ['Сравнить «голую» ошибку без обёрток, которых точно нет','<code>==</code> допустим, но <code>Is</code> надёжнее'],
  ['Показать пользователю текст ошибки','<code>err.Error()</code> (только если это безопасно)']]],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>err == ErrNotFound</code> не срабатывает','Ошибка обёрнута. Используй <code>errors.Is</code>'],
  ['<code>errors.Is</code> не находит','В цепочке <code>%v</code> вместо <code>%w</code>'],
  ['<code>panic: errors: *target must be...</code>','В <code>As</code> передали не указатель или тип без <code>error</code>. Объяви переменную с типом, у которого есть <code>Error()</code>'],
  ['Проверка типа через <code>err.(*MyErr)</code>','Работает только для «голой» ошибки. Используй <code>errors.As</code>'],
  ['Клиент видит внутренний текст ошибки БД','Отдавай статус и общее сообщение, детали пиши в лог']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>Чем errors.Is отличается от errors.As?</b> <code>Is</code> ищет в цепочке конкретное значение, <code>As</code> ищет ошибку заданного типа и присваивает её переменной.',
  '<b>Почему нельзя сравнивать обёрнутую ошибку через ==?</b> Сравнивается внешняя обёртка, а не вложенная ошибка.',
  '<b>Что даёт метод Unwrap?</b> Позволяет <code>Is</code> и <code>As</code> заходить внутрь твоей ошибки.',
  '<b>Как превратить ошибки в HTTP-коды?</b> В одной функции-маппере через <code>errors.Is</code> и <code>errors.As</code>.',
  '<b>Что делает errors.Join?</b> Склеивает несколько ошибок в одну, <code>Is</code> и <code>As</code> видят все.']],
 ['h','9. Практика'],
 ['ol',[
  'Создай три sentinel-ошибки и функцию <code>statusFor</code>, как выше. Добавь тест-таблицу с обёрнутыми ошибками.',
  'Напиши <code>ValidationError{Field, Msg}</code> и достань его через <code>errors.As</code> из ошибки, обёрнутой дважды.',
  'Добавь типу <code>HTTPError</code> метод <code>Is</code> и проверь, что совпадают ошибки с одним кодом и разным текстом.',
  'Намеренно напиши <code>var ve ValidationError</code> и прочитай панику <code>errors.As</code>. Затем запусти <code>go vet</code>.',
  'Склей через <code>errors.Join</code> две ошибки и проверь обе через <code>Is</code>.']],
 ['src',[
  ['Working with Errors in Go 1.13 (блог Go)','https://go.dev/blog/go1.13-errors','Официальное объяснение Is, As, Unwrap, %w','en'],
  ['Пакет errors','https://pkg.go.dev/errors','Документация: Is, As, Join, Unwrap','en'],
  ['Go by Example: Custom Errors','https://gobyexample.com/custom-errors','Короткий пример с errors.As','en'],
  ['Go by Example: Errors','https://gobyexample.com/errors','Базовые ошибки и errors.Is','en'],
  ['Wrapping errors in Go (Bitfield Consulting)','https://bitfieldconsulting.com/posts/wrapping-errors','Обёртки, Is и As на примерах','en'],
  ['100 Go Mistakes: когда оборачивать ошибку','https://100go.co/#ignoring-when-to-wrap-an-error-49','Разделы №49–51 про сравнение ошибок','en'],
  ['Google Go Style Guide: Errors','https://google.github.io/styleguide/go/decisions#errors','Как возвращать и оборачивать ошибки','en']]]],
 q:[["Чем errors.Is отличается от errors.As?","Is ищет конкретное значение в цепочке, As ищет ошибку заданного типа и записывает её в переменную."],["Почему после %w нельзя писать err == ErrNotFound?","Сравнивается внешняя обёртка, а не вложенная ошибка. Нужен errors.Is."],["Что передают вторым аргументом errors.As?","Указатель на переменную нужного типа, например &ve."],["Зачем метод Unwrap у своей ошибки?","Чтобы Is и As могли заходить внутрь и находить вложенную ошибку."],["Как задать «равенство по смыслу» для ошибок?","Добавить метод Is(target error) bool."],["Где превращают ошибки в HTTP-статусы?","В одном месте верхнего слоя через errors.Is и errors.As; неизвестные ошибки отдают как 500."]],
 l:[["art","Working with Errors in Go 1.13 (блог Go)","https://go.dev/blog/go1.13-errors","en"],["doc","Пакет errors","https://pkg.go.dev/errors","en"],["trainer","Go by Example: Custom Errors","https://gobyexample.com/custom-errors","en"],["art","Wrapping errors in Go (Bitfield Consulting)","https://bitfieldconsulting.com/posts/wrapping-errors","en"]]},

"s3-4":{b:[
 ['p',`<b>defer</b> откладывает вызов функции до выхода из текущей функции, как бы он ни произошёл: через return, через панику, через ошибку. Им закрывают файлы, соединения, снимают блокировки. <b>panic</b> останавливает обычный ход программы, а <b>recover</b>, вызванный внутри defer, перехватывает панику.`],
 ['real',5,'каждый день',[
  '<b>Освобождение ресурсов:</b> <code>defer f.Close()</code>, <code>defer mu.Unlock()</code>, <code>defer rows.Close()</code> стоят почти в каждой функции работы с файлами, базой и мьютексами.',
  '<b>Middleware recover:</b> одна паника в обработчике не должна ронять весь сервер. Библиотеки HTTP делают именно это.',
  '<b>Ревью:</b> <code>defer</code> в цикле и потерянная ошибка <code>Close</code> одни из самых частых замечаний.',
  '<b>Собеседования:</b> порядок выполнения defer и вычисление аргументов спрашивают почти всегда.']],
 ['h','1. Порядок и момент вычисления'],
 ['code',`package main

import "fmt"

func main() {
	for i := 1; i <= 3; i++ {
		defer fmt.Println("defer", i)
	}

	x := 10
	defer fmt.Println("x при вызове defer:", x) // аргумент вычисляется сразу
	x = 99
	defer func() { fmt.Println("x в замыкании:", x) }() // замыкание видит последнее значение

	fmt.Println("конец main, x =", x)
}`],
 ['out',`конец main, x = 99
x в замыкании: 99
x при вызове defer: 10
defer 3
defer 2
defer 1`],
 ['ul',[
  '<b>LIFO:</b> отложенные вызовы выполняются в обратном порядке (стек): последний отложенный выполнится первым. Так «закрыть в порядке, обратном открытию».',
  '<b>Аргументы вычисляются в момент <code>defer</code></b>, а не при выполнении. Поэтому <code>defer fmt.Println(x)</code> запомнил 10. Замыкание <code>defer func(){...}()</code> читает переменную в момент выполнения, и видит 99.',
  'Типичное применение: <code>f, err := os.Open(...); if err != nil { return err }; defer f.Close()</code>. <code>defer</code> ставят сразу <b>после успешного открытия</b>, а не раньше (иначе закрывать будет нечего).']],
 ['h','2. defer и именованные результаты'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

func safeDiv(a, b int) (res int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("перехвачено: %v", r)
		}
	}()
	return a / b, nil
}

func counter() (n int) {
	defer func() { n *= 2 }() // defer может поменять именованный результат
	return 21
}

func main() {
	fmt.Println(safeDiv(10, 2))
	fmt.Println(safeDiv(1, 0))
	fmt.Println(counter())
	fmt.Println(errors.Is(nil, nil))
}`],
 ['out',`5 <nil>
0 перехвачено: runtime error: integer divide by zero
42
true`],
 ['p','Отложенная функция выполняется <b>после</b> вычисления значения <code>return</code>, но <b>до</b> фактического возврата, и если результат именованный, может его изменить. Именно так делают «превращение паники в ошибку» и сохранение ошибки <code>Close</code>.'],
 ['h','3. panic'],
 ['code',`package main

import "fmt"

func main() {
	defer fmt.Println("defer выполняется даже при панике")
	fmt.Println("работаю")
	panic("что-то пошло не так")
}`],
 ['out',`работаю
defer выполняется даже при панике
panic: что-то пошло не так
…`],
 ['ul',[
  '<code>panic</code> прекращает обычное выполнение, <b>запускает все отложенные вызовы</b> вверх по стеку и, если паника не перехвачена, завершает программу с трассировкой стека.',
  'Паники вызывают и сами операции: индекс за границей, обращение по nil-указателю, запись в nil-map, деление целых на ноль.',
  'Свой <code>panic</code> оставляй для «этого не должно случиться никогда» (ошибка программиста, невозможное состояние), а обычные ситуации возвращай как <code>error</code>.']],
 ['h','4. recover'],
 ['ul',[
  '<code>recover()</code> работает <b>только внутри отложенной функции</b>. Вызванный не в <code>defer</code>, вернёт nil и ничего не поймает.',
  'Если паника была, <code>recover()</code> возвращает её значение и останавливает раскручивание стека; функция, где стоял defer, завершается нормально.',
  'Перехваченную панику обычно <b>превращают в ошибку</b> (через именованный результат, как <code>safeDiv</code> выше) или логируют и отвечают 500.',
  '<code>recover</code> не ловит панику из других горутин: у каждой горутины защита своя.']],
 ['case','Middleware: одна паника не роняет сервер',[
  '<p>В HTTP-сервере обработчик с багом (например, запись в nil-map) не должен убивать процесс. Обёртка с <code>recover</code> превращает панику в ответ 500, а следующие запросы работают как обычно:</p>']],
 ['code',`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

// recoverMW превращает панику в обычный ответ 500: один запрос не роняет весь сервер
func recoverMW(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				fmt.Println("паника в обработчике:", rec)
				http.Error(w, "внутренняя ошибка", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func main() {
	h := recoverMW(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/boom" {
			var m map[string]int
			m["x"] = 1 // запись в nil-map
		}
		fmt.Fprint(w, "ок")
	}))
	for _, p := range []string{"/", "/boom", "/"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", p, nil))
		fmt.Println(p, rec.Code)
	}
}`],
 ['out',`/ 200
паника в обработчике: assignment to entry in nil map
/boom 500
/ 200`],
 ['p','Пакет <code>net/http</code> уже ловит панику в обработчике сам, но выводит трассировку в лог. В реальных сервисах пишут свой recover-middleware, чтобы логировать структурированно и отдавать единый формат ошибки.'],
 ['h','5. Не терять ошибку Close'],
 ['code',`package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// writeFile не теряет ошибку Close: если запись прошла, ошибка закрытия тоже важна
func writeFile(path, text string) (err error) {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer func() {
		if cerr := f.Close(); err == nil {
			err = cerr
		}
	}()
	_, err = f.WriteString(text)
	return err
}

func main() {
	dir, _ := os.MkdirTemp("", "defer")
	defer os.RemoveAll(dir)

	p := filepath.Join(dir, "a.txt")
	fmt.Println(writeFile(p, "привет"))
	b, _ := os.ReadFile(p)
	fmt.Println(string(b), len(b))

	fmt.Println(writeFile(filepath.Join(dir, "нет", "b.txt"), "x") != nil)
}`],
 ['out',`<nil>
привет 12
true`],
 ['p','Для файла на запись <code>Close</code> может вернуть ошибку (например, данные не сбросились на диск). Простой <code>defer f.Close()</code> её теряет. Если запись важна, сохраняй ошибку закрытия в именованный результат, как выше: ' + A('https://100go.co/#not-handling-defer-errors-54','100 Go Mistakes №54') + '. Для чтения достаточно простого <code>defer f.Close()</code>.'],
 ['h','6. defer в цикле'],
 ['code',`package main

import "fmt"

func process(names []string) {
	for _, n := range names {
		func() { // отдельная функция на итерацию: defer сработает сразу после неё
			defer fmt.Println("закрыл", n)
			fmt.Println("открыл", n)
		}()
	}
}

func main() {
	process([]string{"a.txt", "b.txt"})
}`],
 ['out',`открыл a.txt
закрыл a.txt
открыл b.txt
закрыл b.txt`],
 ['warn','<code>defer</code> срабатывает при выходе из <b>функции</b>, а не из итерации цикла. Если открывать файлы в цикле с <code>defer f.Close()</code>, они все закроются только в конце функции, и при тысячах файлов кончатся дескрипторы. Выносят тело итерации в отдельную функцию (как выше): ' + A('https://100go.co/#using-defer-inside-a-loop-35','100 Go Mistakes №35') + '.'],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>defer</code> в цикле копит ресурсы','Вынеси итерацию в функцию или закрывай явно'],
  ['<code>defer f.Close()</code> до проверки ошибки открытия','Сначала <code>if err != nil</code>, потом <code>defer</code>. Иначе nil-паника'],
  ['Аргумент defer «устарел»','Он вычислен при постановке. Нужна свежая переменная: замыкание'],
  ['<code>recover()</code> ничего не ловит','Он вызван не в defer-функции, либо паника в другой горутине'],
  ['Потеряна ошибка <code>Close</code> при записи','Сохрани её в именованный результат'],
  ['Паника для обычных ошибок','Возвращай <code>error</code>. Паника для ошибок программиста']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>В каком порядке выполняются defer?</b> В обратном (LIFO).',
  '<b>Когда вычисляются аргументы defer?</b> В момент постановки defer, не выполнения.',
  '<b>Выполнится ли defer при панике?</b> Да, отложенные функции выполняются при раскручивании стека.',
  '<b>Где работает recover?</b> Только непосредственно в отложенной функции той же горутины.',
  '<b>Когда panic, а когда error?</b> Ожидаемые сбои (нет файла, плохой ввод) это <code>error</code>. Паника только для ошибок программиста и невозможных состояний.',
  '<b>Можно ли defer менять результат функции?</b> Да, если результат именованный.']],
 ['h','9. Практика'],
 ['ol',[
  'Напиши функцию, которая открывает два файла и закрывает их через два defer. Выведи порядок закрытия.',
  'Сделай <code>safeCall(f func()) error</code>, превращающую панику в ошибку через <code>recover</code>.',
  'Воспроизведи defer в цикле на 3 файлах, затем исправь выносом тела в функцию.',
  'Напиши recover-middleware для своего маленького HTTP-сервера и проверь его через <code>httptest</code>.',
  'Покажи, что <code>defer fmt.Println(x)</code> и <code>defer func(){ fmt.Println(x) }()</code> печатают разное после изменения <code>x</code>.']],
 ['src',[
  ['Defer, Panic, and Recover (блог Go)','https://go.dev/blog/defer-panic-and-recover','Первоисточник: три правила defer и пример с recover','en'],
  ['Effective Go: Defer','https://go.dev/doc/effective_go#defer','Для чего нужен defer','en'],
  ['Effective Go: Recover','https://go.dev/doc/effective_go#recover','Как правильно ловить панику','en'],
  ['Go by Example: Defer','https://gobyexample.com/defer','Короткий пример','en'],
  ['Go by Example: Panic','https://gobyexample.com/panic','Короткий пример','en'],
  ['Go by Example: Recover','https://gobyexample.com/recover','Короткий пример','en'],
  ['100 Go Mistakes: defer','https://100go.co/#ignoring-how-defer-arguments-and-receivers-are-evaluated-47','Разделы №35, 47, 54 про defer','en']]]],
 q:[["В каком порядке выполняются отложенные вызовы?","В обратном порядке (LIFO), последний отложенный выполняется первым."],["Когда вычисляются аргументы defer?","В момент постановки defer. Замыкание читает переменные в момент выполнения."],["Выполнится ли defer при панике?","Да, отложенные вызовы выполняются при раскручивании стека."],["Где работает recover?","Только внутри отложенной функции той же горутины."],["Почему defer в цикле опасен?","Вызовы накапливаются до конца функции: ресурсы не освобождаются вовремя."],["Как defer меняет результат функции?","Через именованные результаты: он выполняется после вычисления return и может их изменить."]],
 l:[["art","Defer, Panic, and Recover (блог Go)","https://go.dev/blog/defer-panic-and-recover","en"],["doc","Effective Go: Defer","https://go.dev/doc/effective_go#defer","en"],["trainer","Go by Example: Defer","https://gobyexample.com/defer","en"],["trainer","Go by Example: Recover","https://gobyexample.com/recover","en"]]},

"s3-5":{b:[
 ['p',`<b>Пакет</b> это папка с Go-файлами, у которых одинаковая строка <code>package имя</code>. Пакеты делят код на части, а <b>видимость</b> решает, что из пакета можно трогать снаружи. Правило одно: имя с <b>заглавной</b> буквы <b>экспортируется</b> (доступно из других пакетов), со <b>строчной</b> остаётся внутри пакета. Ни <code>public</code>, ни <code>private</code> писать не нужно.`],
 ['real',5,'каждый день',[
  '<b>Структура проекта:</b> любой сервис состоит из пакетов (<code>handler</code>, <code>service</code>, <code>store</code>), и умение их резать определяет, насколько код удобно читать.',
  '<b>Скрытие деталей:</b> поля структуры и вспомогательные функции делают неэкспортируемыми, наружу отдают только методы.',
  '<b>Папка <code>internal</code>:</b> код, который нельзя импортировать из других модулей. Так закрывают внутренности сервиса.',
  '<b>Ревью:</b> «лишнее экспортируется», «пакет <code>utils</code>», «циклический импорт» частые замечания.']],
 ['h','1. Модуль и пакеты: как выглядит проект'],
 ['code',`bookmarks/
├── go.mod                  # module example.com/bookmarks
├── main.go                 # package main
├── internal/
│   └── store/
│       └── store.go        # package store, виден только внутри модуля
└── text/
    └── text.go             # package text, виден всем`],
 ['ul',[
  '<b>Модуль</b> (<code>go.mod</code>) это единица версии и зависимостей. Имя модуля задаёт префикс всех путей импорта: <code>example.com/bookmarks/text</code>.',
  '<b>Пакет</b> это одна папка. Все файлы папки имеют одно имя пакета (кроме <code>_test</code>). Имя пакета обычно совпадает с именем папки.',
  '<code>package main</code> с функцией <code>main()</code> это программа. Остальные пакеты библиотеки.',
  'Создание: <code>go mod init example.com/bookmarks</code>. Запуск всего модуля: <code>go run .</code>']],
 ['code',`// go.mod
module example.com/bookmarks

go 1.24`],
 ['code',`// internal/store/store.go
package store

import "sort"

// Store хранит закладки. Тип виден снаружи, поле items нет.
type Store struct {
	items map[int]string
}

func New() *Store { return &Store{items: map[int]string{}} }

func (s *Store) Add(id int, url string) { s.items[id] = url }

func (s *Store) URLs() []string {
	out := make([]string, 0, len(s.items))
	for _, u := range s.items {
		out = append(out, normalize(u))
	}
	sort.Strings(out)
	return out
}

// normalize начинается со строчной буквы: пакет скрывает эту функцию
func normalize(u string) string { return u }`],
 ['code',`// text/text.go
package text

import "unicode"

// Title делает первую букву заглавной (по рунам, чтобы не ломать кириллицу)
func Title(s string) string {
	r := []rune(s)
	if len(r) == 0 {
		return s
	}
	r[0] = unicode.ToUpper(r[0])
	return string(r)
}`],
 ['code',`// main.go
package main

import (
	"fmt"

	"example.com/bookmarks/internal/store"
	str "example.com/bookmarks/text" // псевдоним пакета
)

func main() {
	s := store.New()
	s.Add(1, "https://go.dev")
	s.Add(2, "https://pkg.go.dev")
	fmt.Println(s.URLs(), str.Title("закладки"))
}`],
 ['p','Запуск командой <code>go run .</code> из папки проекта выводит:'],
 ['code',`[https://go.dev https://pkg.go.dev] Закладки`],
 ['ul',[
  'Импорт идёт по <b>пути</b> (<code>example.com/bookmarks/text</code>), а в коде пакет называется по <b>имени пакета</b> (<code>text</code>). При конфликте имён даёшь псевдоним: <code>str "example.com/bookmarks/text"</code>.',
  'Неиспользуемый импорт это ошибка компиляции: Go не терпит лишнего.',
  'Импорт с <code>_</code> (<code>import _ "..."</code>) нужен только ради побочного эффекта <code>init</code> (например, регистрации драйвера БД).']],
 ['h','2. Видимость: заглавная и строчная'],
 ['code',`// попытка залезть в скрытое (файл main.go)
s := store.New()
fmt.Println(s.items)       // поле items скрыто
fmt.Println(store.normalize("x")) // функция normalize скрыта`],
 ['out',`.\\main.go:7:8: s.items undefined (cannot refer to unexported field items)
.\\main.go:8:12: undefined: store.normalize`],
 ['ul',[
  'Доступны снаружи: функции, типы, переменные, константы, <b>поля структур и методы</b> с заглавной буквы.',
  'Поля структуры скрывают, чтобы объект нельзя было привести в неправильное состояние, а работать с ним давали через методы и конструктор <code>New...</code>.',
  'Каждое экспортируемое имя это обещание: его нельзя спокойно переименовать, потому что пользователи сломаются. Экспортируй как можно меньше.',
  'Видимость действует <b>на уровне пакета</b>, а не файла: все файлы одной папки видят строчные имена друг друга.']],
 ['h','3. Папка internal'],
 ['code',`// в другом модуле пытаемся импортировать example.com/bookmarks/internal/store`],
 ['out','main.go:3:8: use of internal package example.com/bookmarks/internal/store not allowed'],
 ['ul',[
  'Пакеты внутри <code>internal/</code> может импортировать только код из родительского каталога от <code>internal</code> и его подкаталогов. Для остального мира они закрыты, и это проверяет компилятор: ' + A('https://go.dev/doc/go1.4#internalpackages','Go 1.4: internal-пакеты') + '.',
  'Так сервисы скрывают реализацию: наружу выставляют несколько пакетов, остальное в <code>internal/</code>.',
  'Типичная раскладка сервиса: <code>cmd/api/main.go</code> (вход), <code>internal/handler</code>, <code>internal/service</code>, <code>internal/store</code>. Официальные советы: ' + A('https://go.dev/doc/modules/layout','Organizing a Go module') + '.']],
 ['h','4. Циклические импорты запрещены'],
 ['out',`package c
	imports c/a from main.go
	imports c/b from a.go
	imports c/a from b.go: import cycle not allowed`],
 ['p','Если пакет <code>a</code> импортирует <code>b</code>, а <code>b</code> импортирует <code>a</code>, программа не соберётся. Это не придирка: так Go заставляет держать зависимости направленными в одну сторону. Как лечат:'],
 ['ul',[
  '<b>Вынести общее</b> (тип, константы) в третий пакет, от которого зависят оба.',
  '<b>Заменить зависимость интерфейсом:</b> пакет-потребитель объявляет нужный ему интерфейс, а конкретную реализацию подставляют снаружи (тема про интерфейсы).',
  '<b>Пересмотреть границы:</b> цикл часто означает, что два пакета на самом деле один.']],
 ['h','5. init и порядок инициализации'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

var a = initA()

func initA() string {
	fmt.Println("1. инициализация переменной a (зависит от b)")
	return b + "!"
}

var b = initB()

func initB() string {
	fmt.Println("0. инициализация переменной b")
	return "b"
}

func init() {
	fmt.Println("2. первая init")
}

func init() {
	fmt.Println("3. вторая init")
}

func main() {
	fmt.Println("4. main", strings.ToUpper(a))
}`],
 ['out',`0. инициализация переменной b
1. инициализация переменной a (зависит от b)
2. первая init
3. вторая init
4. main B!`],
 ['ul',[
  'Порядок: <b>импортированные пакеты</b>, затем <b>переменные уровня пакета</b> (с учётом зависимостей: <code>b</code> раньше <code>a</code>, хотя записан ниже), затем <b>функции <code>init</code></b>, и только потом <code>main</code>.',
  '<code>init()</code> можно объявить несколько раз, даже в одном файле. Вызвать её вручную нельзя.',
  'Не злоупотребляй <code>init</code>: скрытая магия при запуске. Подключения к БД и настройку делают явно в <code>main</code>, чтобы код был предсказуемым и тестируемым.']],
 ['h','6. Как называть пакеты'],
 ['tbl',['Правило','Пример'],[
  ['Короткое, строчными, без подчёркиваний','<code>store</code>, <code>httputil</code>'],
  ['Имя описывает назначение, а не содержимое','<code>auth</code>, а не <code>helpers</code>'],
  ['Не повторяй имя пакета в имени экспорта','<code>store.New</code>, а не <code>store.NewStore</code>'],
  ['Избегай «свалок»','<code>utils</code>, <code>common</code>, <code>base</code>'],
  ['Не совпадай со стандартной библиотекой','не называй свой пакет <code>http</code> или <code>strings</code>']]],
 ['p','Рекомендации: ' + A('https://go.dev/blog/package-names','«Package names» (блог Go)') + ' и ' + A('https://100go.co/#creating-utility-packages-13','100 Go Mistakes №13') + '.'],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>cannot refer to unexported field</code>','Поле или функция со строчной буквы. Дай метод или экспортируй осознанно'],
  ['<code>import cycle not allowed</code>','Вынеси общее в третий пакет или используй интерфейс'],
  ['<code>imported and not used</code>','Убери лишний импорт'],
  ['Пакет <code>utils</code> на 50 несвязанных функций','Разложи по назначению: <code>stringsx</code>, <code>timeutil</code> или встрой рядом с использованием'],
  ['Экспортировано «всё подряд»','Начни со строчных, открывай только нужное'],
  ['Логика в <code>init()</code>','Перенеси в явные вызовы в <code>main</code>']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>Как в Go сделать поле приватным?</b> Назвать со строчной буквы: оно видно только внутри пакета.',
  '<b>Что такое internal?</b> Особая папка: её пакеты можно импортировать только изнутри родительского дерева.',
  '<b>Что такое циклический импорт и как его избежать?</b> Два пакета зависят друг от друга. Выносят общее или вводят интерфейс.',
  '<b>В каком порядке запускается программа?</b> Инициализация зависимостей, переменные пакета, <code>init()</code>, <code>main()</code>.',
  '<b>Чем модуль отличается от пакета?</b> Модуль это набор пакетов с общим <code>go.mod</code> и версией, пакет это одна папка.']],
 ['h','9. Практика'],
 ['ol',[
  'Создай модуль <code>go mod init example.com/notes</code> с пакетами <code>main</code>, <code>store</code> и <code>text</code> по образцу выше.',
  'Скрой поле структуры, добавь конструктор <code>New</code> и методы <code>Add</code>, <code>List</code>. Попробуй обратиться к полю снаружи и прочитай ошибку.',
  'Перенеси <code>store</code> в <code>internal/</code> и убедись, что в другом модуле он недоступен.',
  'Нарочно создай циклический импорт между двумя пакетами и разорви его интерфейсом.',
  'Добавь две функции <code>init</code> и переменную пакета с вызовом функции и проверь порядок вывода.']],
 ['src',[
  ['How to Write Go Code','https://go.dev/doc/code','Официальное введение в модули и пакеты','en'],
  ['Organizing a Go module','https://go.dev/doc/modules/layout','Как раскладывать проект: cmd, internal, пакеты','en'],
  ['Package names (блог Go)','https://go.dev/blog/package-names','Как называть пакеты и экспортируемые имена','en'],
  ['Organizing Go code (блог Go)','https://go.dev/blog/organizing-go-code','Про границы пакетов и зависимости','en'],
  ['Go 1.4: internal packages','https://go.dev/doc/go1.4#internalpackages','Правило internal','en'],
  ['Effective Go: Package names','https://go.dev/doc/effective_go#package-names','Именование в стандартной библиотеке','en'],
  ['Naming conventions in Go (Alex Edwards)','https://www.alexedwards.net/blog/go-naming-conventions','Практичные правила имён','en'],
  ['100 Go Mistakes: организация проекта','https://100go.co/#project-misorganization-12','Разделы №12–14: структура, utils, конфликты имён','en']]]],
 q:[["Как в Go сделать имя приватным?","Начать со строчной буквы: оно доступно только внутри пакета."],["Чем модуль отличается от пакета?","Модуль это набор пакетов с общим go.mod, пакет это одна папка."],["Что даёт папка internal?","Её пакеты могут импортировать только из родительского дерева, для других модулей они закрыты."],["Почему циклические импорты запрещены и как их разорвать?","Они ломают направленность зависимостей. Выносят общее в третий пакет или вводят интерфейс."],["В каком порядке запускается программа?","Зависимости, переменные пакета, функции init, затем main."],["Почему пакет utils считается плохой идеей?","Это свалка несвязанных функций. Пакеты называют по назначению."]],
 l:[["doc","How to Write Go Code","https://go.dev/doc/code","en"],["doc","Organizing a Go module","https://go.dev/doc/modules/layout","en"],["art","Package names (блог Go)","https://go.dev/blog/package-names","en"],["art","Naming conventions in Go (Alex Edwards)","https://www.alexedwards.net/blog/go-naming-conventions","en"]]}
});
fixTicks();
