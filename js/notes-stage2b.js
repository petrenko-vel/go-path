// Конспекты этапа 2 (часть 2). «§» в коде означает обратную кавычку.
mergeNotes({
"s2-4":{b:[
 ['p',`<b>Структура</b> (struct) собирает несколько значений в одно целое: у пользователя есть имя, email и признак «активен», у заказа номер, сумма и статус. В Go нет классов, и структуры вместе с методами (следующая тема) занимают их место. Любая модель данных в сервисе это структура.`],
 ['real',5,'в каждом проекте',[
  '<b>Модели предметной области</b>: <code>User</code>, <code>Order</code>, <code>Product</code>. Из них строится всё остальное.',
  '<b>Запросы и ответы API</b>: структура с тегами <code>json:"..."</code> описывает JSON на входе и на выходе.',
  '<b>Строки из базы данных</b> читаются в структуры.',
  '<b>Конфигурация</b> приложения хранится в структуре, которую заполняют из файла или переменных окружения.',
  '<b>Тесты</b>: таблица случаев это срез безымянных структур (<code>[]struct{ in, want int }</code>).']],
 ['h','1. Объявление и создание'],
 ['code',`package main

import "fmt"

type User struct {
	ID     int
	Name   string
	Email  string
	Active bool
}

func main() {
	u1 := User{ID: 1, Name: "Аня", Email: "anna@example.com"}
	var u2 User
	u3 := User{2, "Боря", "boris@example.com", true} // по позициям: так лучше не писать
	fmt.Printf("%+v\\n", u1)
	fmt.Printf("%+v\\n", u2)
	fmt.Println(u3.Name, u3.Active)
}`],
 ['out',`{ID:1 Name:Аня Email:anna@example.com Active:false}
{ID:0 Name: Email: Active:false}
Боря true`],
 ['ul',[
  '<b>Пиши поля по именам</b> (<code>User{ID: 1, Name: "Аня"}</code>). Запись по позициям ломается, как только в структуру добавят поле.',
  'Непереданные поля получают zero value. Структура <code>var u User</code> готова к использованию сразу.',
  'Поле с заглавной буквы видно из других пакетов, со строчной только внутри пакета. Это правило касается и тегов JSON: неэкспортируемые поля в JSON не попадают.',
  'Для вывода при отладке пригодятся <code>%v</code> (значения), <code>%+v</code> (с именами полей), <code>%#v</code> (как в коде Go).']],
 ['h','2. Конструктор'],
 ['code',`package main

import (
	"errors"
	"fmt"
	"strings"
)

type User struct {
	ID     int
	Name   string
	Email  string
	Active bool
}

// NewUser проверяет данные и создаёт пользователя.
func NewUser(name, email string) (*User, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("имя обязательно")
	}
	return &User{Name: name, Email: strings.ToLower(email), Active: true}, nil
}

func main() {
	u, err := NewUser("  Аня ", "Anna@Example.COM")
	fmt.Printf("%+v %v\\n", *u, err)

	_, err = NewUser("", "x")
	fmt.Println(err)
}`],
 ['out',`{ID:0 Name:Аня Email:anna@example.com Active:true} <nil>
имя обязательно`],
 ['p','В Go нет специальных конструкторов. По соглашению их роль играет функция <code>NewТип</code>, которая возвращает указатель и при необходимости ошибку. Она нормализует данные (обрезает пробелы, приводит email к нижнему регистру) и проверяет инварианты, чтобы некорректный объект просто не появлялся.'],
 ['h','3. Вложенные структуры и встраивание'],
 ['code',`package main

import "fmt"

type Address struct {
	City, Street string
}

type Person struct {
	Name string
	Address // встраивание: поля Address доступны напрямую
}

func main() {
	p := Person{Name: "Аня", Address: Address{City: "Казань", Street: "Баумана"}}
	fmt.Println(p.City, p.Address.Street)
}`],
 ['ul',[
  '<b>Вложенное поле с именем</b> (<code>Addr Address</code>) обращается через точку: <code>p.Addr.City</code>.',
  '<b>Встраивание</b> (тип без имени поля) «поднимает» поля и методы встроенного типа наверх: <code>p.City</code>. Это композиция, а не наследование: Person не является Address, он его содержит.',
  'Встраивание популярно, чтобы подмешать общие поля (<code>ID</code>, <code>CreatedAt</code>) в разные модели, или чтобы «обернуть» тип и добавить поведение.']],
 ['h','4. Теги и JSON'],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
)

type Product struct {
	ID     int    §json:"id"§
	Title  string §json:"title"§
	Price  int    §json:"price"§
	Note   string §json:"note,omitempty"§ // не выводить, если пусто
	Secret string §json:"-"§               // никогда не выводить
	hidden int                              // строчная буква: не экспортируется
}

func main() {
	p := Product{ID: 1, Title: "Чашка", Price: 49900, Secret: "x", hidden: 5}
	b, _ := json.Marshal(p)
	fmt.Println(string(b))

	var back Product
	json.Unmarshal([]byte(§{"id":2,"title":"Кружка","price":1500,"note":"синяя"}§), &back)
	fmt.Printf("%+v\\n", back)
}`],
 ['out',`{"id":1,"title":"Чашка","price":49900}
{ID:2 Title:Кружка Price:1500 Note:синяя Secret: hidden:0}`],
 ['tbl',['Тег','Что делает'],[
  ['<code>json:"id"</code>','Имя поля в JSON (иначе будет <code>ID</code> с заглавной)'],
  ['<code>json:"note,omitempty"</code>','Пропустить поле, если у него zero value'],
  ['<code>json:"-"</code>','Не включать в JSON вообще (пароли, внутренние данные)'],
  ['<code>db:"user_id"</code>','Так же теги используют библиотеки работы с базой: имя колонки'],
  ['<code>validate:"required,email"</code>','И библиотеки валидации: правила проверки']]],
 ['case','Модель в базе и ответ API — разные структуры',[
  '<p>В базе у пользователя есть хэш пароля и служебные поля. Если отдавать из API ту же структуру, пароль рано или поздно утечёт. Поэтому делают две структуры: модель для базы (<code>UserDB</code>) и «ответ» для клиента (<code>UserResponse</code>) с функцией перекладывания полей. Такие структуры называют DTO (data transfer object).</p>']],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
)

type UserDB struct {
	ID           int
	Name         string
	Email        string
	PasswordHash string
}

type UserResponse struct {
	ID   int    §json:"id"§
	Name string §json:"name"§
}

func toResponse(u UserDB) UserResponse {
	return UserResponse{ID: u.ID, Name: u.Name}
}

func main() {
	u := UserDB{ID: 1, Name: "Аня", Email: "a@x.ru", PasswordHash: "$2a$10$..."}
	b, _ := json.Marshal(toResponse(u))
	fmt.Println(string(b))
}`],
 ['out','{"id":1,"name":"Аня"}'],
 ['h','5. Копирование и сравнение'],
 ['code',`package main

import "fmt"

type Point struct{ X, Y int }

func main() {
	a := Point{1, 2}
	b := a // копия
	b.X = 10
	fmt.Println(a, b, a == Point{1, 2})

	pa := &a // указатель на ту же структуру
	pa.X = 7
	fmt.Println(a)

	// безымянная структура: часто в тестах
	tests := []struct {
		in   int
		want string
	}{{1, "one"}, {2, "two"}}
	for _, tc := range tests {
		fmt.Println(tc.in, tc.want)
	}
}`],
 ['out',`{1 2} {10 2} true
{7 2}
1 one
2 two`],
 ['ul',[
  'Присваивание и передача в функцию <b>копируют</b> структуру целиком. Хочешь менять оригинал, передавай указатель.',
  'Структуры сравнимы через <code>==</code>, если все поля сравнимы. Такую структуру можно использовать как ключ в map (<code>map[Point]bool</code>).',
  'Структура с срезом или map внутри через <code>==</code> не сравнивается.',
  'Безымянные структуры и <code>[]struct{...}</code> удобны для таблиц тестовых случаев.']],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>too few values in struct literal</code>','Запись по позициям, а полей больше. Пиши по именам'],
  ['<code>unknown field X in struct literal</code>','Опечатка в имени поля или его нет в структуре'],
  ['Поле не попало в JSON','Название со строчной буквы или тег <code>json:"-"</code>'],
  ['В JSON все поля с заглавной буквы','Нет тегов <code>json:"..."</code>'],
  ['Изменения структуры «теряются»','Передали копию. Передай указатель'],
  ['Пароль или токен утекли в ответ API','Отдавалась модель из базы. Делай отдельный ответ или тег <code>json:"-"</code>']]],
 ['h','7. Практика'],
 ['ol',[
  'Опиши структуру <code>Order</code> с полями: ID, клиент, список позиций (срез структур), сумма, статус. Сделай <code>NewOrder</code>, который проверяет, что позиции не пустые.',
  'Сериализуй заказ в JSON с тегами, пропусти пустые поля через <code>omitempty</code> и прочитай обратно.',
  'Сделай две структуры (<code>UserDB</code> и <code>UserResponse</code>) и функцию перекладывания без утечки пароля.',
  'Встрой <code>Base{ID, CreatedAt}</code> в две разные модели и убедись, что поля доступны напрямую.',
  'Напиши table-driven набор случаев (<code>[]struct{in; want}</code>) для любой своей функции.']],
 ['src',[
  ['Спецификация: Struct types','https://go.dev/ref/spec#Struct_types','Формальные правила, теги и встраивание','en'],
  ['A Tour of Go: Structs','https://go.dev/tour/moretypes/2','Интерактивный урок','en'],
  ['Effective Go: Composite literals','https://go.dev/doc/effective_go#composite_literals','Как создавать структуры идиоматично','en'],
  ['Effective Go: Embedding','https://go.dev/doc/effective_go#embedding','Композиция через встраивание','en'],
  ['Пакет encoding/json','https://pkg.go.dev/encoding/json','Все теги и поведение Marshal и Unmarshal','en'],
  ['JSON and Go (блог Go)','https://go.dev/blog/json','Официальная статья про работу с JSON','en'],
  ['Go by Example: Structs','https://gobyexample.com/structs','Короткий пример','en']]]],
 q:[["Что происходит со структурой при передаче в функцию?","Она копируется целиком. Чтобы менять оригинал, передают указатель."],["Зачем нужны теги json:\"...\" ?","Задают имена полей в JSON, умеют пропускать пустые поля и скрывать секретные."],["Почему поле со строчной буквы не попадает в JSON?","Оно не экспортируется, пакет encoding/json его не видит."],["Чем встраивание отличается от наследования?","Это композиция: поля и методы встроенного типа доступны напрямую, но Person не становится Address."],["Зачем делать отдельные структуры для базы и для ответа API?","Чтобы случайно не отдать лишнее (хэш пароля) и менять формат ответа независимо от базы."]],
 l:[["art","JSON and Go (блог Go)","https://go.dev/blog/json","en"],["doc","Пакет encoding/json","https://pkg.go.dev/encoding/json","en"],["doc","Effective Go: Embedding","https://go.dev/doc/effective_go#embedding","en"],["trainer","A Tour of Go: Structs","https://go.dev/tour/moretypes/2","en"]]},

"s2-5":{b:[
 ['p',`<b>Метод</b> это функция, привязанная к типу: <code>func (a *Account) Deposit(...)</code> читается как «у счёта есть операция внести деньги». Методы превращают структуры из пассивных наборов полей в объекты с поведением. Главный вопрос темы: <b>получатель по значению или по указателю</b>.`],
 ['real',5,'в каждом проекте',[
  '<b>Сервисы и репозитории</b> это структуры с методами: <code>func (s *UserService) Create(...)</code>, <code>func (r *Repo) FindByID(...)</code>.',
  '<b>HTTP-обработчики</b> часто методы структуры, которая хранит зависимости (базу, логгер).',
  '<b>Методы на именованных типах</b>: <code>Status.String()</code> делает вывод читаемым.',
  '<b>Реализация интерфейсов</b>: чтобы тип «подходил» интерфейсу, у него должны быть нужные методы (этап 3).',
  '<b>На ревью</b> спрашивают: «почему здесь значение, а не указатель?» Тема стоит усвоить.']],
 ['h','1. Объявление метода'],
 ['code',`func (a *Account) Deposit(amount int) error { ... }
//     └──────┬──────┘ └────┬───┘ └─── обычные параметры и результаты
//        получатель     имя метода`],
 ['p','Получатель пишется в скобках перед именем метода. По соглашению его называют одной-двумя буквами от имени типа (<code>a</code>, <code>s</code>, <code>srv</code>), а не <code>this</code> или <code>self</code>. Вызов: <code>acc.Deposit(100)</code>.'],
 ['h','2. Значение или указатель: главное различие'],
 ['code',`package main

import "fmt"

type Counter struct{ n int }

func (c Counter) IncValue()    { c.n++ } // работает с копией
func (c *Counter) IncPointer() { c.n++ } // работает с оригиналом
func (c Counter) Value() int   { return c.n }

func main() {
	var c Counter
	c.IncValue()
	fmt.Println(c.Value())
	c.IncPointer()
	fmt.Println(c.Value())
}`],
 ['out',`0
1`],
 ['p','Метод со значением получает копию и меняет её, оригинал остаётся прежним: точь-в-точь как с аргументами функции из прошлых тем. Метод с указателем меняет саму структуру. Это ровно та же разница, что между <code>incByValue</code> и <code>incByPointer</code> в теме про указатели.'],
 ['tbl',['Выбирай указатель, если','Выбирай значение, если'],[
  ['Метод <b>меняет</b> структуру','Метод только читает, а структура маленькая'],
  ['Структура большая, копировать дорого','Тип небольшой и «неизменяемый»: точка, время, деньги'],
  ['В структуре есть <code>sync.Mutex</code> или подобное: копировать нельзя','Тип это число или строка с методом (<code>type Status int</code>)'],
  ['Другие методы типа уже с указателем: <b>не смешивай</b>','Типы-справочники вроде <code>time.Time</code>']]],
 ['warn','<b>Не смешивай получателей в одном типе.</b> Если хотя бы один метод с указателем, делай указателем все. Иначе часть методов будет работать с копией, а часть с оригиналом, и в этом тяжело разобраться. Это правило из официальных рекомендаций по ревью.'],
 ['h','3. Метод, который может вернуть ошибку'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

type Account struct {
	Owner   string
	balance int // со строчной: меняется только методами
}

func NewAccount(owner string) *Account {
	return &Account{Owner: owner}
}

func (a *Account) Deposit(amount int) error {
	if amount <= 0 {
		return errors.New("сумма должна быть положительной")
	}
	a.balance += amount
	return nil
}

func (a *Account) Withdraw(amount int) error {
	if amount > a.balance {
		return fmt.Errorf("недостаточно средств: на счёте %d, нужно %d", a.balance, amount)
	}
	a.balance -= amount
	return nil
}

func (a *Account) Balance() int { return a.balance }

func main() {
	acc := NewAccount("Аня")
	fmt.Println(acc.Deposit(1000))
	fmt.Println(acc.Withdraw(300))
	fmt.Println(acc.Withdraw(5000))
	fmt.Println(acc.Deposit(-5))
	fmt.Println(acc.Balance())
}`],
 ['out',`<nil>
<nil>
недостаточно средств: на счёте 700, нужно 5000
сумма должна быть положительной
700`],
 ['p','Это и есть «инкапсуляция по-Go»: поле <code>balance</code> скрыто (строчная буква), снаружи баланс меняется только через методы, которые проверяют правила. Нельзя положить отрицательную сумму или снять больше, чем есть.'],
 ['h','4. Методы на своих типах: Stringer'],
 ['code',`package main

import "fmt"

type Status int

const (
	New Status = iota
	Paid
	Done
)

func (s Status) String() string {
	switch s {
	case New:
		return "новый"
	case Paid:
		return "оплачен"
	case Done:
		return "выполнен"
	}
	return "неизвестно"
}

func main() {
	fmt.Println(New, Paid, Done)
	fmt.Printf("%d %v %s\\n", Paid, Paid, Paid)
}`],
 ['out',`новый оплачен выполнен
1 оплачен оплачен`],
 ['p','Метод можно повесить на любой <b>свой</b> именованный тип, не только на структуры: <code>type Status int</code>, <code>type IDs []int</code>. Метод <code>String() string</code> особенный: <code>fmt</code> вызывает его сам при печати. Это завершение темы про константы: теперь статусы красиво выводятся в логах. (Интерфейс <code>fmt.Stringer</code> разберём в этапе 3.)'],
 ['h','5. Метод и вызов на значении'],
 ['code',`package main

type Counter struct{ n int }

func (c *Counter) Inc() { c.n++ }

func main() {
	Counter{}.Inc()
}`],
 ['out','./main.go:8:12: cannot call pointer method Inc on Counter'],
 ['p','Метод с указателем нельзя вызвать у «временного» значения, у которого нет адреса. Для обычной переменной (<code>var c Counter; c.Inc()</code>) Go подставит <code>&amp;c</code> сам, а для литерала нет. Набор методов типа (method set) определяет, какие интерфейсы он реализует, об этом в следующем этапе.'],
 ['case','Сервис с зависимостями',[
  '<p>В реальном сервисе структура хранит то, что нужно её методам: соединение с базой, логгер, настройки. Конструктор принимает эти зависимости, а методы пользуются ими. Так устроен почти любой слой бизнес-логики:</p>']],
 ['code',`package main

import "fmt"

type Repo struct{ titles map[int]string }

func NewRepo() *Repo {
	return &Repo{titles: map[int]string{1: "Go за 7 дней"}}
}

func (r *Repo) Title(id int) (string, bool) {
	t, ok := r.titles[id]
	return t, ok
}

type Service struct{ repo *Repo }

func NewService(r *Repo) *Service { return &Service{repo: r} }

func (s *Service) Describe(id int) (string, error) {
	t, ok := s.repo.Title(id)
	if !ok {
		return "", fmt.Errorf("книга %d не найдена", id)
	}
	return "Книга: " + t, nil
}

func main() {
	svc := NewService(NewRepo())
	for _, id := range []int{1, 2} {
		d, err := svc.Describe(id)
		if err != nil {
			fmt.Println("ошибка:", err)
			continue
		}
		fmt.Println(d)
	}
}`],
 ['out',`Книга: Go за 7 дней
ошибка: книга 2 не найдена`],
 ['p','В реальном проекте <code>Repo</code> ходит в базу данных, а <code>Service</code> принимает его через интерфейс, чтобы в тестах подставить заглушку. Но каркас тот же: структура, конструктор, методы.'],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Метод «не меняет» структуру','Получатель по значению. Поставь указатель'],
  ['<code>cannot call pointer method X on T</code>','Вызов у значения без адреса (литерал, результат функции). Сохрани в переменную'],
  ['<code>copylocks</code> от <code>go vet</code>','Копируешь структуру с мьютексом. Используй указатель на получателе'],
  ['Часть методов видит изменения, часть нет','Смешаны получатели. Сделай все методы с указателем'],
  ['Метод вызван на nil-указателе','Паника при обращении к полям. Проверь, что конструктор вернул объект']]],
 ['h','7. Практика'],
 ['ol',[
  'Реализуй <code>Stack</code> со срезом внутри и методами <code>Push</code>, <code>Pop</code> (возвращает значение и ok), <code>Len</code>.',
  'Сделай <code>Account</code> с методом <code>Transfer(to *Account, amount int) error</code> и проверкой всех случаев.',
  'Напиши тип <code>Role</code> с константами и методом <code>String()</code>. Выведи через <code>%v</code> и <code>%d</code>.',
  'Преврати получателя в значение в <code>Counter.IncPointer</code> и объясни, что сломалось.',
  'Собери <code>Repo</code> и <code>Service</code> как в примере, добавь метод <code>Create</code> и проверку на пустое название.']],
 ['src',[
  ['Спецификация: Method declarations','https://go.dev/ref/spec#Method_declarations','Формальные правила методов и получателей','en'],
  ['A Tour of Go: Methods','https://go.dev/tour/methods/1','Интерактивные уроки','en'],
  ['A Tour of Go: Pointer receivers','https://go.dev/tour/methods/4','Урок про получателя-указатель','en'],
  ['Go FAQ: value or pointer receivers?','https://go.dev/doc/faq#methods_on_values_or_pointers','Официальный ответ, когда что выбирать','en'],
  ['Go Wiki: Receiver Type','https://go.dev/wiki/CodeReviewComments#receiver-type','Правила выбора получателя из рекомендаций по ревью','en'],
  ['Effective Go: Methods','https://go.dev/doc/effective_go#methods','Идиоматичные методы','en'],
  ['Go by Example: Methods','https://gobyexample.com/methods','Короткий пример','en']]]],
 q:[["Чем отличается получатель по значению от получателя по указателю?","По значению метод работает с копией и не меняет оригинал, по указателю меняет саму структуру."],["Когда нужен указатель на получателе?","Когда метод меняет структуру, она большая или содержит мьютекс, или другие методы типа уже с указателем."],["Можно ли смешивать получателей в одном типе?","Не стоит: часть методов будет работать с копией, часть с оригиналом."],["Что делает метод String() у типа?","fmt вызывает его автоматически при печати значения."],["Почему поле balance со строчной буквы?","Чтобы менять его можно было только методами, которые проверяют правила."]],
 l:[["doc","Go FAQ: value or pointer receivers?","https://go.dev/doc/faq#methods_on_values_or_pointers","en"],["doc","Go Wiki: Receiver Type","https://go.dev/wiki/CodeReviewComments#receiver-type","en"],["trainer","A Tour of Go: Methods","https://go.dev/tour/methods/1","en"],["trainer","Go by Example: Methods","https://gobyexample.com/methods","en"]]},

"s2-6":{b:[
 ['p',`Второй законченный проект: <b>список задач в консоли</b>. Это уже ближе к настоящему бэкенду: у программы есть <b>данные</b> (структура <code>Task</code>), <b>хранилище</b> (<code>TaskList</code> со срезом) и <b>операции</b> (добавить, показать, отметить, удалить). Если заменить консоль на HTTP, получится ядро API. Именно этот каркас дальше превратится в веб-сервис.`],
 ['real',5,'так начинается любой CRUD-сервис',[
  '<b>CRUD</b> (create, read, update, delete) это четыре операции, на которых держится большинство бэкендов. Здесь они все: <code>Add</code>, <code>Print</code>, <code>Done</code>, <code>Delete</code>.',
  '<b>Слой хранения отдельно от интерфейса</b>: <code>TaskList</code> ничего не знает про консоль. Завтра подключим HTTP или базу, не переписывая логику.',
  '<b>Ошибки наверх</b>: методы возвращают <code>error</code>, а печатает их только <code>main</code>.',
  '<b>Идентификаторы</b> выдаёт хранилище (счётчик <code>nextID</code>), как это делает база данных (auto increment).']],
 ['h','1. Что должно получиться'],
 ['ul',[
  'Команды в цикле: <code>add текст</code>, <code>list</code>, <code>done N</code>, <code>delete N</code>, <code>exit</code>.',
  'У каждой задачи есть номер, текст и признак «выполнена».',
  'Понятные ошибки: пустой текст, нет такого номера, нечисловой номер, неизвестная команда.',
  'Код разделён: структуры и методы отдельно, разбор команд отдельно.']],
 ['h','2. Структура решения'],
 ['tbl',['Часть','Отвечает за'],[
  ['<code>Task</code>','Одна задача: ID, текст, выполнена ли'],
  ['<code>TaskList</code>','Хранилище: срез задач и счётчик ID. Методы <code>Add</code>, <code>Done</code>, <code>Delete</code>, <code>Print</code>'],
  ['<code>handle</code>','Разбор одной команды: какой метод вызвать'],
  ['<code>main</code>','Цикл чтения строк и печать ошибок']]],
 ['h','3. Программа целиком'],
 ['code',`package main

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Task struct {
	ID   int
	Text string
	Done bool
}

type TaskList struct {
	tasks  []Task
	nextID int
}

func NewTaskList() *TaskList {
	return &TaskList{nextID: 1}
}

var errEmpty = errors.New("текст задачи пустой")

func (l *TaskList) Add(text string) (Task, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return Task{}, errEmpty
	}
	t := Task{ID: l.nextID, Text: text}
	l.nextID++
	l.tasks = append(l.tasks, t)
	return t, nil
}

// find возвращает индекс задачи или -1.
func (l *TaskList) find(id int) int {
	for i, t := range l.tasks {
		if t.ID == id {
			return i
		}
	}
	return -1
}

func (l *TaskList) Done(id int) error {
	i := l.find(id)
	if i < 0 {
		return fmt.Errorf("задачи %d нет", id)
	}
	l.tasks[i].Done = true
	return nil
}

func (l *TaskList) Delete(id int) error {
	i := l.find(id)
	if i < 0 {
		return fmt.Errorf("задачи %d нет", id)
	}
	l.tasks = append(l.tasks[:i], l.tasks[i+1:]...)
	return nil
}

func (l *TaskList) Print() {
	if len(l.tasks) == 0 {
		fmt.Println("список пуст")
		return
	}
	for _, t := range l.tasks {
		mark := " "
		if t.Done {
			mark = "x"
		}
		fmt.Printf("[%s] %d. %s\\n", mark, t.ID, t.Text)
	}
}

// handle выполняет одну команду. Вернёт ошибку, если команда не удалась.
func handle(l *TaskList, cmd, arg string) error {
	switch cmd {
	case "add":
		t, err := l.Add(arg)
		if err != nil {
			return err
		}
		fmt.Println("добавлено:", t.ID)
	case "list":
		l.Print()
	case "done", "delete":
		id, err := strconv.Atoi(arg)
		if err != nil {
			return fmt.Errorf("нужен номер задачи, а не %q", arg)
		}
		if cmd == "done" {
			return l.Done(id)
		}
		return l.Delete(id)
	default:
		return fmt.Errorf("неизвестная команда %q", cmd)
	}
	return nil
}

func main() {
	list := NewTaskList()
	fmt.Println("Команды: add текст, list, done N, delete N, exit")
	sc := bufio.NewScanner(os.Stdin)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "exit" {
			break
		}
		if line == "" {
			continue
		}
		cmd, arg, _ := strings.Cut(line, " ")
		if err := handle(list, cmd, arg); err != nil {
			fmt.Println("ошибка:", err)
		}
	}
}`],
 ['p','Пример сеанса (ввод: <code>add Купить молоко</code>, <code>add Выучить срезы</code>, <code>list</code>, <code>done 1</code>, <code>list</code>, <code>delete 2</code>, <code>done 9</code>, <code>add</code>, <code>fly</code>, <code>list</code>, <code>exit</code>):'],
 ['out',`Команды: add текст, list, done N, delete N, exit
добавлено: 1
добавлено: 2
[ ] 1. Купить молоко
[ ] 2. Выучить срезы
[x] 1. Купить молоко
[ ] 2. Выучить срезы
ошибка: задачи 9 нет
ошибка: текст задачи пустой
ошибка: неизвестная команда "fly"
[x] 1. Купить молоко`],
 ['h','4. Что в программе от тем этапа 2'],
 ['tbl',['Тема','Где используется'],[
  ['Структуры','<code>Task</code> и <code>TaskList</code>'],
  ['Методы с указателем','<code>(l *TaskList) Add</code>, <code>Done</code>, <code>Delete</code>: меняют хранилище'],
  ['Срезы','<code>append</code> для добавления, <code>append(l.tasks[:i], l.tasks[i+1:]...)</code> для удаления'],
  ['Указатели','Конструктор возвращает <code>*TaskList</code>, <code>handle</code> принимает его'],
  ['Строки','<code>strings.Cut</code>, <code>TrimSpace</code>, форматирование через <code>Printf</code>'],
  ['Ошибки','<code>errEmpty</code> как значение, <code>fmt.Errorf</code> с контекстом'],
  ['Условия и циклы','<code>switch</code> по команде, цикл чтения строк']]],
 ['warn','Есть <b>ловушка</b>: в методе <code>Done</code> нельзя написать <code>for _, t := range l.tasks { t.Done = true }</code>: <code>t</code> это копия, и задача не изменится. Поэтому в программе стоит <code>l.tasks[i].Done = true</code> по индексу.'],
 ['h','5. Как делать самой'],
 ['ol',[
  'Начни со структуры <code>Task</code> и функции, которая печатает список. Захардкодь два элемента.',
  'Добавь <code>TaskList</code> и методы <code>Add</code> и <code>Print</code>. Проверь в <code>main</code> вызовами.',
  'Добавь <code>Done</code> и <code>Delete</code> с проверкой «такой задачи нет».',
  'Сделай цикл чтения команд и функцию <code>handle</code>. Каждый случай ошибки проверь руками.',
  'Напиши тесты на методы <code>TaskList</code> (этап про тесты) или хотя бы проверку в <code>main</code>.']],
 ['h','6. Развитие проекта'],
 ['ul',[
  '<b>Сохранение в файл</b>: записать задачи в JSON через <code>encoding/json</code> и <code>os.WriteFile</code>, читать при запуске. Для этого структуре понадобятся теги <code>json:"..."</code>.',
  '<b>Быстрый поиск по ID</b>: хранить ещё <code>map[int]int</code> (ID → индекс) и найти задачу за O(1) вместо перебора. Подумай, что придётся обновлять при удалении.',
  '<b>Фильтры</b>: <code>list done</code> и <code>list todo</code>.',
  '<b>Сроки</b>: поле <code>Due time.Time</code> и сортировка по сроку.',
  '<b>Веб-сервис</b>: те же методы <code>TaskList</code> вызываются из HTTP-обработчиков. Это следующий большой этап.']],
 ['h','7. Чек-лист готовности'],
 ['ul',[
  'Любая ошибка ввода даёт понятное сообщение, и программа продолжает работать.',
  'Печатает ошибки только <code>main</code> (в <code>handle</code> и методах только <code>return err</code>).',
  '<code>go fmt ./...</code> и <code>go vet ./...</code> без замечаний.',
  'Хранилище не знает про консоль, а команда <code>handle</code> не лезет в срез напрямую.',
  'Проект в репозитории, в README описаны команды.']],
 ['src',[
  ['Пакет strings: Cut','https://pkg.go.dev/strings#Cut','Разрезать «команда аргумент» по первому пробелу','en'],
  ['Пакет bufio','https://pkg.go.dev/bufio','Построчное чтение ввода','en'],
  ['Пакет encoding/json','https://pkg.go.dev/encoding/json','Для следующего шага: сохранение задач в файл','en'],
  ['Пакет os: WriteFile и ReadFile','https://pkg.go.dev/os#WriteFile','Запись и чтение файла целиком','en'],
  ['Go by Example: Reading Files','https://gobyexample.com/reading-files','Чтение файла','en'],
  ['Go by Example: Writing Files','https://gobyexample.com/writing-files','Запись в файл','en'],
  ['Go Wiki: Project Layout (go.dev/doc/modules/layout)','https://go.dev/doc/modules/layout','Как выделить пакеты, когда проект вырастет','en']]]],
 q:[["Почему хранилище не должно печатать в консоль?","Чтобы то же ядро работало с HTTP, тестами или базой без переписывания."],["Почему в Done нельзя менять t в for _, t := range?","t копия элемента, надо менять через индекс l.tasks[i]."],["Как удалить элемент из среза по индексу?","append(s[:i], s[i+1:]...) или slices.Delete(s, i, i+1)."],["Кто печатает ошибки и почему?","main (верхний уровень). Нижние функции возвращают error, чтобы решение о выводе принимал вызывающий код."],["Как ускорить поиск задачи по ID?","Хранить map ID → индекс или map ID → задача вместо перебора среза."]],
 l:[["doc","Пакет strings: Cut","https://pkg.go.dev/strings#Cut","en"],["doc","Пакет os: WriteFile","https://pkg.go.dev/os#WriteFile","en"],["trainer","Go by Example: Writing Files","https://gobyexample.com/writing-files","en"]]}
});
