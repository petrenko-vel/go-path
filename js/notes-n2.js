// Конспекты: интерфейсы, embedding, ошибки (номера тем по новой карте). «§» в коде означает обратную кавычку.
mergeNotes({
"s3-0":{b:[
 ['p',`<b>Интерфейс</b> в Go описывает, <b>что тип умеет делать</b>, не говоря, чем он является. Это набор методов. Тип подходит интерфейсу, если у него есть эти методы, и ничего объявлять не нужно: Go проверяет совпадение сам (неявная реализация). Благодаря этому код получается гибким: функция принимает «что-то, что умеет отправлять уведомление», и ей всё равно, email это, SMS или заглушка в тесте.`],
 ['real',5,'каждый день',[
  '<b>Тесты:</b> реальную базу или отправку писем подменяют заглушкой, которая подходит под тот же интерфейс.',
  '<b>Границы слоёв:</b> сервис знает про интерфейс хранилища, но не про PostgreSQL.',
  '<b>Стандартная библиотека построена на интерфейсах:</b> <code>io.Reader</code>, <code>io.Writer</code>, <code>error</code>, <code>fmt.Stringer</code>, <code>http.Handler</code>, <code>sort.Interface</code>.',
  '<b>Собеседования:</b> интерфейсы и «ловушка nil» спрашивают почти всегда.']],
 ['case','Подмена хранилища в тесте',[
  '<p>Сервис хочет получить пользователя из базы. Если он зависит от конкретного <code>*sql.DB</code>, тест нужно запускать вместе с базой. Если он зависит от маленького интерфейса <code>UserStore</code> с одним методом, в тесте можно подставить обычную map. Именно так устроены почти все тесты сервисов на Go:</p>']],
 ['code',`package main

import (
	"errors"
	"fmt"
)

type User struct {
	ID   int
	Name string
}

var ErrNotFound = errors.New("пользователь не найден")

// интерфейс описывает только то, что нужно сервису
type UserStore interface {
	Get(id int) (User, error)
}

type Service struct{ store UserStore }

func (s Service) Greeting(id int) (string, error) {
	u, err := s.store.Get(id)
	if err != nil {
		return "", err
	}
	return "Привет, " + u.Name + "!", nil
}

// fakeStore подменяет базу данных в тесте
type fakeStore map[int]User

func (f fakeStore) Get(id int) (User, error) {
	if u, ok := f[id]; ok {
		return u, nil
	}
	return User{}, ErrNotFound
}

func main() {
	svc := Service{store: fakeStore{1: {1, "Аня"}}}
	for _, id := range []int{1, 2} {
		g, err := svc.Greeting(id)
		if err != nil {
			fmt.Println("ошибка:", err)
			continue
		}
		fmt.Println(g)
	}
}`],
 ['out',`Привет, Аня!
ошибка: пользователь не найден`],
 ['h','1. Неявная реализация'],
 ['code',`package main

import "fmt"

type Notifier interface {
	Notify(to, text string) error
}

type EmailNotifier struct{ From string }

func (e EmailNotifier) Notify(to, text string) error {
	fmt.Printf("email от %s для %s: %s\\n", e.From, to, text)
	return nil
}

type SMSNotifier struct{}

func (SMSNotifier) Notify(to, text string) error {
	fmt.Printf("sms для %s: %s\\n", to, text)
	return nil
}

// notifyAll принимает интерфейс: ей всё равно, что именно внутри
func notifyAll(n Notifier, users []string, text string) {
	for _, u := range users {
		n.Notify(u, text)
	}
}

func main() {
	users := []string{"anna", "boris"}
	notifyAll(EmailNotifier{From: "bot@example.com"}, users, "заказ оплачен")
	notifyAll(SMSNotifier{}, users[:1], "код 1234")
}`],
 ['out',`email от bot@example.com для anna: заказ оплачен
email от bot@example.com для boris: заказ оплачен
sms для anna: код 1234`],
 ['ul',[
  'Слова <code>implements</code> нет: достаточно, чтобы у типа были методы с теми же именами, параметрами и результатами.',
  '<b>Интерфейс объявляют там, где его используют</b> (в пакете потребителя), а не рядом с реализацией: так пакет получает ровно то, что ему нужно.',
  '<b>Маленькие интерфейсы лучше больших.</b> Один-три метода, как <code>io.Reader</code> с единственным <code>Read</code>. Чем больше интерфейс, тем труднее его реализовать и подменить. Вот как это формулируют ' + A('https://go-proverbs.github.io/','Go Proverbs') + ': «чем больше интерфейс, тем слабее абстракция».',
  'Правило «принимай интерфейсы, возвращай структуры»: параметры функций делай интерфейсами, а возвращай конкретные типы. Это эвристика, а не закон: ' + A('https://100go.co/#returning-interfaces-7','100 Go Mistakes №7') + '.']],
 ['h','2. Проверка на этапе компиляции'],
 ['code',`package main

import "fmt"

type Notifier interface {
	Notify(to string) error
}

type Email struct{}

func (e *Email) Notify(to string) error { fmt.Println("email", to); return nil }

type SMS struct{}

func (SMS) Send(to string) {}

var _ Notifier = (*Email)(nil)
var _ Notifier = SMS{}

func main() {}`],
 ['out','./main.go:18:18: cannot use SMS{} (value of struct type SMS) as Notifier value in variable declaration: SMS does not implement Notifier (missing method Notify)'],
 ['p','Строка <code>var _ Notifier = (*Email)(nil)</code> ничего не делает при запуске, но заставляет компилятор проверить, что тип подходит интерфейсу. Принятый приём: если реализуешь интерфейс из другого пакета, ставь такую строку рядом с типом, и забытый метод станет ошибкой сборки, а не сюрпризом в рантайме.'],
 ['h','3. Методы с указателем и интерфейсы'],
 ['code',`package main

import "fmt"

type Notifier interface {
	Notify(to string) error
}

type Email struct{}

func (e *Email) Notify(to string) error { fmt.Println("email", to); return nil }

func main() {
	var n Notifier = Email{}
	n.Notify("anna")
}`],
 ['out','./main.go:14:19: cannot use Email{} (value of struct type Email) as Notifier value in variable declaration: Email does not implement Notifier (method Notify has pointer receiver)'],
 ['p','Если метод объявлен с указателем (<code>func (e *Email) ...</code>), интерфейсу подходит только <b>указатель</b> <code>&amp;Email{}</code>, но не значение <code>Email{}</code>. Правило такое: у значения <code>T</code> набор методов только с получателем-значением, у <code>*T</code> оба вида. Выбор получателя разбирали в теме про методы.'],
 ['h','4. Пустой интерфейс, type assertion, type switch'],
 ['code',`package main

import "fmt"

func describe(v any) string {
	switch x := v.(type) {
	case nil:
		return "ничего"
	case int:
		return fmt.Sprintf("число %d", x)
	case string:
		return "строка " + x
	case []int:
		return fmt.Sprintf("срез из %d чисел", len(x))
	case error:
		return "ошибка: " + x.Error()
	case fmt.Stringer:
		return "умеет String: " + x.String()
	default:
		return fmt.Sprintf("неизвестный тип %T", x)
	}
}

func main() {
	var v any = "привет"
	s, ok := v.(string)
	fmt.Println(s, ok)
	n, ok := v.(int)
	fmt.Println(n, ok)

	for _, x := range []any{nil, 42, "go", []int{1, 2}, fmt.Errorf("сбой"), 3.14} {
		fmt.Println(describe(x))
	}
}`],
 ['out',`привет true
0 false
ничего
число 42
строка go
срез из 2 чисел
ошибка: сбой
неизвестный тип float64`],
 ['ul',[
  '<code>any</code> (то же, что <code>interface{}</code>) подходит под любое значение: так хранят «неизвестные» данные, например разобранный JSON.',
  '<b>Type assertion</b> <code>v.(string)</code> достаёт значение конкретного типа. Версия с двумя результатами <code>s, ok := v.(string)</code> безопасна, а без <code>ok</code> при несовпадении будет паника.',
  '<b>Type switch</b> <code>switch x := v.(type)</code> выбирает ветку по типу, и в каждой ветке <code>x</code> уже нужного типа.',
  'Не злоупотребляй <code>any</code>: теряется проверка типов компилятором. Это называется «interface pollution»: ' + A('https://100go.co/#interface-pollution-5','100 Go Mistakes №5') + '.']],
 ['h','5. Ловушка: nil внутри интерфейса'],
 ['p','Значение интерфейса состоит из двух частей: <b>тип</b> и <b>значение</b>. Интерфейс равен <code>nil</code> только когда пусты обе. Если положить в него nil-указатель, тип уже есть, и интерфейс «не nil». Эту ошибку часто допускают при возврате <code>error</code>.'],
 ['code',`package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "моя ошибка" }

func find(fail bool) error {
	var e *MyErr // nil-указатель
	if fail {
		e = &MyErr{}
	}
	return e // внутри error лежит (*MyErr)(nil), а не nil
}

func findOK(fail bool) error {
	if fail {
		return &MyErr{}
	}
	return nil // настоящий nil
}

func main() {
	err := find(false)
	fmt.Println(err == nil, err != nil)
	fmt.Printf("%T\\n", err)

	err = findOK(false)
	fmt.Println(err == nil)
}`],
 ['out',`false true
*main.MyErr
true`],
 ['warn','Из-за этого функция «без ошибки» сообщает об ошибке, и проверка <code>if err != nil</code> срабатывает. Правило: возвращай <b>голый</b> <code>nil</code>, а не переменную конкретного типа. Классический разбор есть в ' + A('https://go.dev/doc/faq#nil_error','Go FAQ') + ' и в статье Russ Cox ' + A('https://research.swtch.com/interfaces','«Go Data Structures: Interfaces»') + '.'],
 ['h','6. Стандартные интерфейсы'],
 ['code',`package main

import (
	"fmt"
	"sort"
	"strings"
)

type byLen []string

func (b byLen) Len() int           { return len(b) }
func (b byLen) Less(i, j int) bool { return len(b[i]) < len(b[j]) }
func (b byLen) Swap(i, j int)      { b[i], b[j] = b[j], b[i] }

type Celsius float64

func (c Celsius) String() string { return fmt.Sprintf("%.1f°C", float64(c)) }

func main() {
	words := []string{"банан", "ю", "яблоко", "киви"}
	sort.Sort(byLen(words))
	fmt.Println(words)

	fmt.Println(Celsius(21.55), []Celsius{1, 2.5})

	var sb strings.Builder
	var w fmt.Stringer = Celsius(0)
	fmt.Fprintf(&sb, "стартовая: %v, пустая: %q", w, "")
	fmt.Println(sb.String())
}`],
 ['out',`[ю киви банан яблоко]
21.6°C [1.0°C 2.5°C]
стартовая: 0.0°C, пустая: ""`],
 ['tbl',['Интерфейс','Метод','Где встречается'],[
  ['<code>error</code>','<code>Error() string</code>','Любая ошибка'],
  ['<code>fmt.Stringer</code>','<code>String() string</code>','Красивый вывод в <code>Println</code>, логах'],
  ['<code>io.Reader</code>, <code>io.Writer</code>','<code>Read</code>, <code>Write</code>','Файлы, сеть, тела HTTP, буферы'],
  ['<code>sort.Interface</code>','<code>Len</code>, <code>Less</code>, <code>Swap</code>','Своя сортировка'],
  ['<code>http.Handler</code>','<code>ServeHTTP</code>','Каждый HTTP-обработчик']]],
 ['h','7. Как это работает внутри (кратко)'],
 ['code',`значение типа error:
┌───────────────┬──────────────┐
│ тип           │ значение     │
│ (*MyErr)      │ nil-указатель│
└───────────────┴──────────────┘
== nil  только если оба поля пусты`],
 ['p','Интерфейс хранит пару «тип и значение»: именно поэтому в него можно положить любое значение, а метод вызывается динамически по типу. Подробный разбор устройства, который сейчас читают все, кто хочет понять тему глубоко, это статья Russ Cox, ссылка в источниках.'],
 ['h','8. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>does not implement ... (missing method ...)</code>','Не хватает метода. Проверь имя и сигнатуру'],
  ['<code>does not implement ... (method ... has pointer receiver)</code>','Передай указатель <code>&amp;T{}</code> вместо значения'],
  ['<code>err != nil</code> всегда true','Вернула nil-указатель в <code>error</code>. Возвращай голый <code>nil</code>'],
  ['<code>panic: interface conversion</code>','<code>v.(string)</code> без <code>ok</code>, а внутри другой тип. Используй <code>s, ok := ...</code>'],
  ['Огромный интерфейс на 10 методов','Раздели на маленькие, потребитель берёт только нужные'],
  ['Интерфейс «на всякий случай», у которого одна реализация','Не создавай заранее. Появится вторая реализация или тест, тогда вынесешь']]],
 ['h','9. Вопросы с собеседований'],
 ['ul',[
  '<b>Как в Go реализуется интерфейс?</b> Неявно: тип подходит, если у него есть все методы интерфейса.',
  '<b>Что значит «принимай интерфейсы, возвращай структуры»?</b> Параметры функций делай интерфейсами для гибкости, а возвращай конкретные типы, чтобы вызывающий получил все возможности.',
  '<b>Когда интерфейс равен nil?</b> Когда пусты и тип, и значение. nil-указатель внутри интерфейса даёт «не nil».',
  '<b>Чем any отличается от обычного интерфейса?</b> Это интерфейс без методов: подходит любое значение, но компилятор типы не проверяет.',
  '<b>Где объявлять интерфейс?</b> У потребителя, а не у реализации.']],
 ['h','10. Практика'],
 ['ol',[
  'Напиши интерфейс <code>Storage</code> с методами <code>Save</code> и <code>Load</code> и две реализации: в памяти (map) и в файле (JSON). Передавай их в одну функцию.',
  'Сделай <code>Service</code> с зависимостью от интерфейса логгера и подставь «записывающий» логгер, чтобы проверить, что событие залогировано.',
  'Воспроизведи ловушку nil и исправь её. Объясни, почему <code>%T</code> показал тип.',
  'Добавь строку <code>var _ Interface = (*Type)(nil)</code> рядом с одной из своих реализаций.',
  'Реализуй <code>fmt.Stringer</code> для типа <code>Status</code> из темы про константы и убедись, что <code>Println</code> печатает текст.']],
 ['src',[
  ['A Tour of Go: Interfaces','https://go.dev/tour/methods/9','Интерактивный урок','en'],
  ['Effective Go: Interfaces and other types','https://go.dev/doc/effective_go#interfaces_and_types','Как задумывались интерфейсы в Go','en'],
  ['Go Code Review Comments: Interfaces','https://go.dev/wiki/CodeReviewComments#interfaces','Где объявлять интерфейсы и как их называть','en'],
  ['Go Proverbs','https://go-proverbs.github.io/','«Чем больше интерфейс, тем слабее абстракция» и другие правила','en'],
  ['Go Data Structures: Interfaces (Russ Cox)','https://research.swtch.com/interfaces','Как интерфейсы устроены внутри','en'],
  ['Go FAQ: почему err != nil для nil-указателя','https://go.dev/doc/faq#nil_error','Официальный разбор ловушки','en'],
  ['Google Go Style Guide: Interfaces','https://google.github.io/styleguide/go/decisions#interfaces','Практические решения','en'],
  ['100 Go Mistakes: interface pollution и возврат интерфейсов','https://100go.co/#interface-pollution-5','Разделы №5–7','en'],
  ['Go by Example: Interfaces','https://gobyexample.com/interfaces','Короткий пример','en'],
  ['Go: типы и интерфейсы (Хабр, ноябрь 2025)','https://habr.com/ru/articles/963182/','Русскоязычный разбор type assertion, type switch, nil-интерфейса и generics','ru']]]],
 q:[["Как тип «реализует» интерфейс в Go?","Неявно: достаточно, чтобы у него были все методы интерфейса."],["Почему значение Email{} не подходит интерфейсу, если метод объявлен с указателем?","У значения набор методов только с получателем-значением. Нужен указатель &Email{}."],["Когда интерфейс равен nil?","Когда пусты и тип, и значение. nil-указатель внутри интерфейса даёт «не nil»."],["Что делает var _ I = (*T)(nil)?","Проверяет на этапе компиляции, что *T реализует I."],["Чем безопасная type assertion отличается от обычной?","Форма s, ok := v.(T) возвращает ok вместо паники при несовпадении типа."],["Где объявлять интерфейс?","Там, где он используется (у потребителя), и делать его маленьким."]],
 l:[["trainer","A Tour of Go: Interfaces","https://go.dev/tour/methods/9","en"],["doc","Effective Go: Interfaces","https://go.dev/doc/effective_go#interfaces_and_types","en"],["doc","Go Proverbs","https://go-proverbs.github.io/","en"],["art","Go Data Structures: Interfaces (Russ Cox)","https://research.swtch.com/interfaces","en"],["art","Go: типы и интерфейсы (Хабр)","https://habr.com/ru/articles/963182/","ru"]]},

"s3-1":{b:[
 ['p',`В Go нет наследования классов. Вместо него используют <b>композицию</b>: тип «содержит» другой тип, а чтобы не писать длинное <code>s.logger.Println</code>, внутренний тип можно <b>встроить</b> (embedding): объявить поле без имени, и поля с методами встроенного типа «поднимутся» на уровень внешнего. Это удобно, но легко принять за наследование, а это не оно.`],
 ['real',4,'часто',[
  '<b>Общие поля моделей:</b> <code>Base{ID, CreatedAt}</code> встраивают в разные структуры, чтобы не повторяться.',
  '<b>Обёртки (декораторы):</b> тип встраивает интерфейс и переопределяет один метод: логирование, метрики, кэш.',
  '<b>Middleware:</b> <code>statusWriter</code> встраивает <code>http.ResponseWriter</code> и запоминает код ответа.',
  '<b>Сервисы:</b> встроенный логгер или клиент, чтобы вызывать его методы напрямую.',
  '<b>Ревью:</b> «зачем здесь embedding» или «почему <code>sync.Mutex</code> встроен» одно из частых замечаний.']],
 ['h','1. Встраивание и продвижение'],
 ['code',`package main

import "fmt"

type Address struct {
	City, Street string
}

func (a Address) Full() string { return a.City + ", " + a.Street }

type Person struct {
	Name string
	Address // встроенное поле: без имени
}

type Logger struct{ Prefix string }

func (l Logger) Println(msg string) { fmt.Println(l.Prefix + msg) }

type Service struct {
	Logger
	Name string
}

func main() {
	p := Person{Name: "Аня", Address: Address{City: "Казань", Street: "Баумана"}}
	fmt.Println(p.City, p.Address.Street, p.Full())

	s := Service{Logger: Logger{Prefix: "[orders] "}, Name: "orders"}
	s.Println("сервис запущен")
}`],
 ['out',`Казань Баумана Казань, Баумана
[orders] сервис запущен`],
 ['ul',[
  'Поле без имени (<code>Address</code>) называется встроенным, его имя совпадает с именем типа. К нему можно обратиться полностью: <code>p.Address.Street</code>.',
  '<b>Продвижение:</b> поля и методы встроенного типа доступны напрямую: <code>p.City</code>, <code>p.Full()</code>, <code>s.Println(...)</code>.',
  'Встроить можно и структуру, и указатель на неё, и интерфейс.']],
 ['h','2. Это не наследование'],
 ['code',`package main

import "fmt"

type Animal struct{ Name string }

func (a Animal) Speak() string { return a.Name + " издаёт звук" }
func (a Animal) Intro() string { return "Это " + a.Name + ": " + a.Speak() }

type Dog struct{ Animal }

// Speak закрывает (затеняет) продвинутый метод Animal.Speak
func (d Dog) Speak() string { return d.Name + " лает" }

func main() {
	d := Dog{Animal{"Бобик"}}
	fmt.Println(d.Speak())
	fmt.Println(d.Animal.Speak())
	fmt.Println(d.Intro()) // Intro лежит в Animal и зовёт Animal.Speak: переопределения «вверх» нет
}`],
 ['out',`Бобик лает
Бобик издаёт звук
Это Бобик: Бобик издаёт звук`],
 ['p','<code>Dog.Speak</code> закрывает метод встроенного типа только <b>для обращений снаружи</b>. Внутри <code>Animal.Intro</code> вызывается <code>Animal.Speak</code>: у Go нет виртуальных методов, поэтому «перекрытие» не работает вверх по цепочке, как в Java или C++. Это главное, что отличает embedding от наследования. Поэтому <code>Dog</code> не «является» <code>Animal</code>: <b>функцию, принимающую Animal, нельзя вызвать с Dog</b>. Для общего поведения используют интерфейсы. Подробнее: ' + A('https://go.dev/doc/faq#inheritance','Go FAQ: почему нет наследования') + '.'],
 ['h','3. Неоднозначность'],
 ['code',`package main

import "fmt"

type A struct{}

func (A) Name() string { return "A" }

type B struct{}

func (B) Name() string { return "B" }

type C struct {
	A
	B
}

func main() {
	c := C{}
	fmt.Println(c.A.Name(), c.B.Name())
	fmt.Println(c.Name())
}`],
 ['out','./main.go:21:16: ambiguous selector c.Name'],
 ['p','Если два встроенных типа имеют одинаковое имя поля или метода, компилятор ругается <b>только при обращении</b> к этому имени, и его нужно уточнить: <code>c.A.Name()</code>. Если же внешний тип сам объявит такой метод, он выиграет (как <code>Dog.Speak</code> выше).'],
 ['h','4. Встраивание интерфейса: декоратор'],
 ['code',`package main

import "fmt"

type Store interface {
	Get(id int) string
	Set(id int, v string)
}

type memStore struct{ data map[int]string }

func (m *memStore) Get(id int) string    { return m.data[id] }
func (m *memStore) Set(id int, v string) { m.data[id] = v }

// loggingStore встраивает интерфейс и переопределяет только Get
type loggingStore struct {
	Store
}

func (l loggingStore) Get(id int) string {
	v := l.Store.Get(id)
	fmt.Printf("Get(%d) -> %q\\n", id, v)
	return v
}

func main() {
	var s Store = loggingStore{&memStore{data: map[int]string{}}}
	s.Set(1, "первое") // метод пришёл из встроенного Store
	s.Get(1)
	s.Get(2)
}`],
 ['out',`Get(1) -> "первое"
Get(2) -> ""`],
 ['p','Самый полезный приём: тип встраивает <b>интерфейс</b>, получает все его методы «бесплатно» и переопределяет только нужный. Так делают логирование, метрики, кэширование поверх существующей реализации.'],
 ['case','Middleware: запомнить код ответа',[
  '<p>Обработчик HTTP пишет статус через <code>ResponseWriter</code>, но прочитать его потом нельзя. Обёртка встраивает <code>ResponseWriter</code>, перехватывает <code>WriteHeader</code> и запоминает код. Остальные методы (Write, Header) достаются «бесплатно»:</p>']],
 ['code',`package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

// statusWriter запоминает статус, который записал обработчик
type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		fmt.Printf("%s %s -> %d\\n", r.Method, r.URL.Path, sw.status)
	})
}

func main() {
	h := logging(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/missing" {
			http.NotFound(w, r)
			return
		}
		fmt.Fprint(w, "ок")
	}))
	for _, path := range []string{"/", "/missing"} {
		h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", path, nil))
	}
}`],
 ['out',`GET / -> 200
GET /missing -> 404`],
 ['h','5. Что утекает в публичный API'],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
	"sync"
)

type Base struct {
	ID      int    §json:"id"§
	Created string §json:"created"§
}

type Post struct {
	Base
	Title string §json:"title"§
}

type Counter struct {
	sync.Mutex // встроили: теперь Lock и Unlock торчат из Counter
	n          int
}

type SafeCounter struct {
	mu sync.Mutex // поле с именем: наружу ничего не торчит
	n  int
}

func (c *SafeCounter) Inc() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n++
}

func main() {
	b, _ := json.Marshal(Post{Base{1, "2026-11-17"}, "Заголовок"})
	fmt.Println(string(b))

	var c Counter
	c.Lock() // кто угодно снаружи может заблокировать счётчик
	c.n++
	c.Unlock()

	var s SafeCounter
	s.Inc()
	fmt.Println(c.n, s.n)
}`],
 ['out',`{"id":1,"created":"2026-11-17","title":"Заголовок"}
1 1`],
 ['ul',[
  '<b>JSON сплющивает встроенную структуру:</b> поля <code>Base</code> оказываются на одном уровне с полями <code>Post</code>. Поэтому <code>Base</code> удобно встраивать в модели.',
  '<b>Embedding открывает API.</b> Встроенный <code>sync.Mutex</code> делает <code>Lock</code> и <code>Unlock</code> методами <code>Counter</code>: любой код снаружи может блокировать счётчик. Мьютекс, как и подключение к базе, держат именованным полем и закрывают за методами.',
  'Встраивай тип, только если хочешь, чтобы <b>все его экспортируемые методы</b> стали частью твоего типа. Если нужен лишь один-два метода, держи поле с именем и пиши обёртки: ' + A('https://100go.co/#not-being-aware-of-the-possible-problems-with-type-embedding-10','100 Go Mistakes №10') + '.',
  'Не делай длинные цепочки (A встраивает B, который встраивает C): откуда пришёл метод, будет непонятно.']],
 ['h','6. Когда встраивать, а когда нет'],
 ['tbl',['Задача','Решение'],[
  ['Общие поля у нескольких моделей (ID, даты)','Встроить структуру'],
  ['Подменить или дополнить поведение интерфейса','Встроить интерфейс и переопределить метод'],
  ['Держать зависимость (база, мьютекс, клиент)','Поле с именем'],
  ['Нужна полиморфность','Интерфейс, а не embedding'],
  ['Хочется «унаследовать» поведение','Сделать поле и вызывать методы явно']]],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Ожидала переопределения «вверх»','В Go нет виртуальных методов: метод внутри встроенного типа зовёт свой. Передай нужное поведение через интерфейс'],
  ['<code>ambiguous selector</code>','Два встроенных типа с одним именем. Уточни: <code>c.A.Name()</code>'],
  ['Мьютекс «торчит» наружу','Он встроен. Сделай именованное поле <code>mu</code>'],
  ['<code>nil pointer dereference</code> при вызове метода встроенного указателя','Встроенный указатель не заполнен. Создай значение в конструкторе'],
  ['Функция для <code>Animal</code> не принимает <code>Dog</code>','Это не наследование. Опиши общее поведение интерфейсом']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>Есть ли в Go наследование?</b> Нет. Есть композиция и встраивание, а общее поведение описывают интерфейсами.',
  '<b>Что происходит, если у внешнего типа и встроенного одинаковые методы?</b> Внешний метод закрывает встроенный при обращении снаружи, но внутренние вызовы встроенного типа по-прежнему идут в его метод.',
  '<b>В чём риск встраивания типа из другого пакета?</b> Все его экспортируемые методы становятся частью твоего API, и при их изменении ломаются потребители.',
  '<b>Как сделать декоратор в Go?</b> Встроить интерфейс в структуру и переопределить нужные методы.']],
 ['h','9. Практика'],
 ['ol',[
  'Сделай <code>Base{ID, CreatedAt, UpdatedAt}</code> и встрой его в <code>User</code> и <code>Order</code>. Сериализуй обе структуры в JSON и посмотри плоский результат.',
  'Напиши <code>cachingStore</code>, который встраивает <code>Store</code>, хранит в map результаты <code>Get</code> и вызывает исходный <code>Get</code> только при промахе.',
  'Воспроизведи ошибку <code>ambiguous selector</code> и исправь её явным обращением.',
  'Покажи на своём примере, что переопределённый метод не вызывается из метода встроенного типа.',
  'Замени встроенный <code>sync.Mutex</code> в своём коде на именованное поле и закрой доступ к нему.']],
 ['src',[
  ['Effective Go: Embedding','https://go.dev/doc/effective_go#embedding','Зачем встраивание и как оно работает','en'],
  ['Спецификация: Struct types','https://go.dev/ref/spec#Struct_types','Точные правила продвижения полей и методов','en'],
  ['Go FAQ: почему нет наследования','https://go.dev/doc/faq#inheritance','Объяснение от авторов языка','en'],
  ['Go by Example: Struct Embedding','https://gobyexample.com/struct-embedding','Короткий пример','en'],
  ['100 Go Mistakes: проблемы встраивания','https://100go.co/#not-being-aware-of-the-possible-problems-with-type-embedding-10','Утечки API и подводные камни','en'],
  ['Go by Example: Interfaces','https://gobyexample.com/interfaces','Интерфейсы как замена наследованию','en']]]],
 q:[["Есть ли в Go наследование?","Нет, только композиция и встраивание. Общее поведение описывают интерфейсами."],["Что такое продвижение полей и методов?","Поля и методы встроенного типа доступны напрямую на внешнем типе."],["Вызовется ли переопределённый метод из метода встроенного типа?","Нет, у Go нет виртуальных методов: встроенный метод зовёт свою версию."],["Когда появляется ambiguous selector?","Когда два встроенных типа имеют одинаковое имя и к нему обращаются без уточнения."],["Почему sync.Mutex лучше не встраивать?","Lock и Unlock станут частью публичного API типа: любой код снаружи сможет блокировать его."],["Как с помощью встраивания сделать декоратор?","Встроить интерфейс и переопределить нужные методы, остальные достанутся автоматически."]],
 l:[["doc","Effective Go: Embedding","https://go.dev/doc/effective_go#embedding","en"],["doc","Go FAQ: почему нет наследования","https://go.dev/doc/faq#inheritance","en"],["trainer","Go by Example: Struct Embedding","https://gobyexample.com/struct-embedding","en"],["art","100 Go Mistakes: проблемы встраивания","https://100go.co/#not-being-aware-of-the-possible-problems-with-type-embedding-10","en"]]},

"s3-2":{b:[
 ['p',`В Go нет исключений. Ошибка это <b>обычное значение</b> типа <code>error</code>, которое функция возвращает вторым результатом, а вызывающий код проверяет и решает, что делать. Многословно, зато видно, где что может сломаться. Любая функция, которая ходит в базу, читает файл или разбирает ввод, возвращает <code>(результат, error)</code>.`],
 ['real',5,'каждый день',[
  '<b>Каждый вызов</b> с побочными эффектами (файл, сеть, база, разбор) возвращает ошибку, и <code>if err != nil</code> встречается в Go-коде тысячи раз.',
  '<b>Контекст в ошибке</b> («загрузка пользователя 7: запрос к базе: не найдено») ускоряет поиск причины по логам.',
  '<b>Ошибки пересекают границы слоёв:</b> репозиторий, сервис, обработчик, HTTP-статус.',
  '<b>Ревью:</b> проглоченная ошибка (<code>_ = f()</code>) или ошибка, обработанная дважды, одно из самых частых замечаний.']],
 ['h','1. error: это интерфейс'],
 ['code',`type error interface {
	Error() string
}`],
 ['p','Любой тип с методом <code>Error() string</code> это ошибка. Стандартные способы создать её: <code>errors.New("текст")</code> и <code>fmt.Errorf("текст %d", n)</code>. Значение <code>nil</code> означает «ошибки нет».'],
 ['h','2. Ошибки как значения'],
 ['p','Раз ошибка это значение, с ней можно работать как с любым другим: хранить, сравнивать, передавать, накапливать. Вот Rob Pike в ' + A('https://go.dev/blog/errors-are-values','«Errors are values»') + ' показывает приём: не проверять ошибку после каждой записи, а запомнить первую ошибку в самом объекте.'],
 ['code',`package main

import (
	"errors"
	"fmt"
	"io"
	"strconv"
)

var ErrNegative = errors.New("отрицательное значение")

func parsePositive(s string) (int, error) {
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0, err
	}
	if n < 0 {
		return 0, ErrNegative
	}
	return n, nil
}

// errWriter запоминает первую ошибку и дальше ничего не пишет: проверка один раз
type errWriter struct {
	w   io.Writer
	err error
}

func (e *errWriter) write(s string) {
	if e.err != nil {
		return
	}
	_, e.err = io.WriteString(e.w, s)
}

type brokenWriter struct{ after int }

func (b *brokenWriter) Write(p []byte) (int, error) {
	if b.after == 0 {
		return 0, errors.New("диск переполнен")
	}
	b.after--
	return len(p), nil
}

func main() {
	for _, s := range []string{"42", "-5", "abc"} {
		n, err := parsePositive(s)
		fmt.Println(n, err, err == ErrNegative)
	}

	ew := &errWriter{w: &brokenWriter{after: 2}}
	for _, line := range []string{"раз", "два", "три", "четыре"} {
		ew.write(line)
	}
	fmt.Println("итог записи:", ew.err)
}`],
 ['out',`42 <nil> false
0 отрицательное значение true
0 strconv.Atoi: parsing "abc": invalid syntax false
итог записи: диск переполнен`],
 ['ul',[
  '<b>Sentinel-ошибка</b> (<code>var ErrNegative = errors.New(...)</code>) это заранее созданное значение, с которым можно сравнивать. Имена принято начинать с <code>Err</code>.',
  'Стандартные примеры: <code>io.EOF</code>, <code>os.ErrNotExist</code>, <code>sql.ErrNoRows</code>.',
  'Тот же приём «накопить ошибку» применён в <code>bufio.Scanner</code> (проверка <code>scanner.Err()</code> после цикла).']],
 ['h','3. Добавляем контекст: %w'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("не найдено")

func repoGet(id int) error {
	return fmt.Errorf("запрос к базе: %w", ErrNotFound)
}

func serviceGet(id int) error {
	if err := repoGet(id); err != nil {
		return fmt.Errorf("загрузка пользователя %d: %w", id, err)
	}
	return nil
}

func main() {
	err := serviceGet(7)
	fmt.Println(err)
	fmt.Println(errors.Unwrap(err))
	fmt.Println(errors.Unwrap(errors.Unwrap(err)) == ErrNotFound)

	// %v вместо %w: цепочка рвётся
	cut := fmt.Errorf("сбой: %v", ErrNotFound)
	fmt.Println(errors.Is(cut, ErrNotFound), errors.Is(err, ErrNotFound))
}`],
 ['out',`загрузка пользователя 7: запрос к базе: не найдено
запрос к базе: не найдено
true
false true`],
 ['ul',[
  '<code>fmt.Errorf("...: %w", err)</code> добавляет контекст и <b>сохраняет</b> исходную ошибку внутри, чтобы её можно было найти позже (<code>errors.Is</code> и <code>errors.As</code> разберём в следующей теме).',
  '<code>%v</code> тоже добавит текст, но исходную ошибку «забудет»: цепочка порвётся, как видно по последней строке вывода.',
  '<b>Контекст пиши как путь</b> от большего к меньшему: «загрузка пользователя 7: запрос к базе: не найдено». В логе будет видна вся цепочка вызовов.',
  'Сообщение ошибки принято писать со строчной буквы и без точки в конце, потому что оно становится частью длинной цепочки.']],
 ['h','4. Несколько ошибок сразу: errors.Join'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

func validate(name string, age int) error {
	var errs []error
	if name == "" {
		errs = append(errs, errors.New("имя обязательно"))
	}
	if age < 0 || age > 150 {
		errs = append(errs, fmt.Errorf("возраст вне диапазона: %d", age))
	}
	return errors.Join(errs...) // nil, если ошибок нет
}

func main() {
	fmt.Println(validate("Аня", 30))
	err := validate("", 200)
	fmt.Println(err)
	fmt.Println(validate("Боря", -1) != nil)
}`],
 ['out',`<nil>
имя обязательно
возраст вне диапазона: 200
true`],
 ['p','<code>errors.Join</code> (Go 1.20) склеивает несколько ошибок в одну: сообщение выводится построчно. Так показывают пользователю <b>все</b> проблемы формы сразу, а не по одной. Если все аргументы <code>nil</code>, результат тоже <code>nil</code>.'],
 ['h','5. Обработать или вернуть: но не оба'],
 ['code',`package main

import (
	"errors"
	"fmt"
	"log"
	"os"
)

func readConfig(path string) error {
	_, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("чтение конфига: %w", err)
	}
	return nil
}

func main() {
	log.SetFlags(0)
	log.SetOutput(os.Stdout)

	err := readConfig("/нет/такого/файла.yaml")
	// ПЛОХО: и записали в лог, и вернули: ошибка попадёт в журнал дважды
	// ХОРОШО: ошибку либо возвращают наверх, либо обрабатывают здесь, но не оба действия
	if err != nil {
		log.Println("не удалось запустить:", errors.Is(err, os.ErrNotExist))
	}
}`],
 ['out','не удалось запустить: true'],
 ['warn','<b>Правило «обработать один раз».</b> Нижние функции возвращают ошибку с контекстом. Логирует или показывает её тот, кто принимает решение (обычно верхний уровень: <code>main</code> или обработчик запроса). Иначе одна ошибка превращается в пять одинаковых строк в журнале: ' + A('https://100go.co/#handling-an-error-twice-52','100 Go Mistakes №52') + '.'],
 ['h','6. error или panic'],
 ['tbl',['Ситуация','Что использовать'],[
  ['Файла нет, база недоступна, неверный ввод','<code>error</code>: это нормальная жизнь программы'],
  ['Ошибка программиста: индекс за пределами, nil-указатель','<code>panic</code> (случится сама), чинится в коде'],
  ['Невозможное состояние при старте (не загрузился обязательный конфиг)','Можно вернуть ошибку наверх и завершить программу в <code>main</code>'],
  ['Библиотечная функция получила заведомо неверные аргументы','Обычно <code>error</code>, а не <code>panic</code>']]],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Ошибку проглотили: <code>_ = f()</code> или результат не проверен','Проверяй каждую. Пропуск допустим, только если ясно почему (и объясни комментарием)'],
  ['Одна ошибка в логе пять раз','Логируют и возвращают. Выбери одно'],
  ['<code>errors.Is</code> не находит ошибку','В цепочке стоит <code>%v</code> вместо <code>%w</code>'],
  ['Сообщения «Failed to ...: » с заглавной и точкой','Пиши с маленькой и без точки: «загрузка пользователя: ...»'],
  ['<code>err != nil</code> всегда true','Возвращён nil-указатель в <code>error</code>: см. тему про интерфейсы'],
  ['Ошибка закрытия файла потеряна','Смотри тему про <code>defer</code>: именованный результат и <code>Close</code>']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>Почему в Go нет исключений?</b> Ошибки сделаны значениями, чтобы обработка была явной и видной в коде.',
  '<b>Что такое error?</b> Интерфейс с единственным методом <code>Error() string</code>.',
  '<b>Чем %w отличается от %v в fmt.Errorf?</b> <code>%w</code> сохраняет исходную ошибку для <code>errors.Is/As</code>, <code>%v</code> только добавляет текст.',
  '<b>Что такое sentinel-ошибка?</b> Заранее созданное значение ошибки (<code>io.EOF</code>), с которым сравнивают.',
  '<b>Где логировать ошибки?</b> На верхнем уровне, один раз; нижние слои возвращают её с контекстом.']],
 ['h','9. Практика'],
 ['ol',[
  'Напиши функцию <code>loadUser(id int) (User, error)</code> с тремя слоями вызовов (обработчик, сервис, репозиторий). Каждый слой добавляет контекст через <code>%w</code>.',
  'Добавь sentinel-ошибки <code>ErrNotFound</code> и <code>ErrEmpty</code>, возвращай их из разных мест и сравнивай.',
  'Сделай <code>validateForm</code>, которая возвращает все ошибки полей через <code>errors.Join</code>.',
  'Найди в своём мини-проекте место, где ошибка логируется и возвращается одновременно, и исправь.',
  'Реализуй свой тип <code>errWriter</code> и запиши через него три строки в файл с одной проверкой ошибки.']],
 ['src',[
  ['Errors are values (блог Go)','https://go.dev/blog/errors-are-values','Rob Pike: ошибки как обычные значения','en'],
  ['Error handling and Go (блог Go)','https://go.dev/blog/error-handling-and-go','Базовая статья об error, Errorf и типах ошибок','en'],
  ['Пакет errors','https://pkg.go.dev/errors','New, Is, As, Join, Unwrap','en'],
  ['Go by Example: Errors','https://gobyexample.com/errors','Короткий пример','en'],
  ['Don\'t just check errors, handle them gracefully (Dave Cheney)','https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully','Не только проверять, но и осмысленно обрабатывать','en'],
  ['Go Wiki: Code Review Comments (Error Strings)','https://go.dev/wiki/CodeReviewComments#error-strings','Как писать тексты ошибок','en'],
  ['100 Go Mistakes: управление ошибками','https://100go.co/#ignoring-when-to-wrap-an-error-49','Разделы №49–54 про ошибки','en']]]],
 q:[["Что такое error в Go?","Интерфейс с методом Error() string. nil означает «ошибки нет»."],["Почему Go возвращает ошибки значениями?","Чтобы обработка была явной: видно, где что может пойти не так."],["Чем %w отличается от %v в fmt.Errorf?","%w сохраняет исходную ошибку в цепочке для errors.Is и errors.As, %v только вставляет текст."],["Что такое sentinel-ошибка?","Заранее созданное значение вроде io.EOF, с которым сравнивают."],["Когда использовать errors.Join?","Когда нужно вернуть несколько ошибок сразу, например все ошибки валидации."],["Почему не стоит и логировать, и возвращать одну ошибку?","Она попадёт в журнал несколько раз. Обрабатывают её один раз, наверху."]],
 l:[["art","Errors are values (блог Go)","https://go.dev/blog/errors-are-values","en"],["art","Error handling and Go (блог Go)","https://go.dev/blog/error-handling-and-go","en"],["doc","Пакет errors","https://pkg.go.dev/errors","en"],["art","Don't just check errors, handle them gracefully (Dave Cheney)","https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully","en"]]}
});
fixTicks();
