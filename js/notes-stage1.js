// Конспекты этапа 1 (часть 1). «§» в коде означает обратную кавычку.
mergeNotes({
"s1-0":{b:[
 ['p',`Каждая переменная в Go всегда имеет значение. Если ты его не задала, Go сам подставит <b>zero value</b>: ноль для чисел, пустую строку для строк, <code>false</code> для bool, <code>nil</code> для указателей, срезов и map. Никакого <code>undefined</code> и «мусора из памяти» не бывает. Это решение сильно влияет на то, как пишется код, и на типичные баги.`],
 ['real',5,'каждый день',[
  '<b>Каждая функция</b> объявляет переменные: <code>:=</code> встречается в Go-коде чаще, чем любая другая конструкция.',
  '<b>Приём запроса.</b> Поля, которых не было в JSON, превращаются в zero value. Из-за этого пользователь, который не указал возраст, и пользователь с возрастом 0 выглядят одинаково.',
  '<b>Структуры</b> создают пустыми и дозаполняют: <code>var cfg Config</code>. Незаполненные поля безопасны.',
  '<b>Ревью.</b> Про <code>:=</code> и <code>var</code> в командах есть негласные правила, их разберём ниже.']],
 ['h','1. Три способа объявить переменную'],
 ['tbl',['Запись','Когда использовать'],[
  ['<code>var x int</code>','Нужно значение по умолчанию (ноль), а присвоить позже'],
  ['<code>var x int = 5</code> или <code>var x = 5</code>','Явный тип нужен редко: когда значение само подразумевает другой тип, например <code>var f float64 = 5</code>'],
  ['<code>x := 5</code>','Основной способ внутри функции: объявить и сразу задать, тип выводится сам']]],
 ['ul',[
  '<code>:=</code> работает <b>только внутри функций</b>. На уровне пакета пиши <code>var</code>, иначе будет <code>syntax error: non-declaration statement outside function body</code>.',
  'Слева от <code>:=</code> должна быть хотя бы одна <b>новая</b> переменная. Остальные просто получат новое значение.',
  'Несколько переменных за раз: <code>a, b := 1, 2</code>. Блок <code>var ( ... )</code> группирует объявления на уровне пакета.',
  'Пустой идентификатор <code>_</code> выбрасывает значение, которое тебе не нужно: <code>_, err := f()</code>.']],
 ['h','2. Zero values на практике'],
 ['tbl',['Тип','Zero value','Как проверить'],[
  ['<code>int</code>, <code>float64</code> и другие числа','0','<code>x == 0</code>'],
  ['<code>string</code>','"" (пустая строка)','<code>s == ""</code>'],
  ['<code>bool</code>','false','<code>!ok</code>'],
  ['указатель, срез, map, функция, интерфейс, канал','nil','<code>x == nil</code>'],
  ['структура','каждое поле получает свой zero value','сравнить поле']]],
 ['code',`package main

import "fmt"

func main() {
	var age int
	var name string
	var active bool
	var price float64
	var p *int
	var s []int
	var m map[string]int
	fmt.Println(age, name == "", active, price, p == nil, s == nil, m == nil)
}`],
 ['out','0 true false 0 true true true'],
 ['case','Поле запроса не пришло: JSON и zero value',[
  '<p>Клиент отправляет в API <code>{"name": "Аня"}</code>, а поле <code>age</code> забыл. Сервис декодирует тело в структуру:</p>']],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
)

type CreateUser struct {
	Name string §json:"name"§
	Age  int    §json:"age"§
}

func main() {
	body := []byte(§{"name": "Аня"}§)
	var req CreateUser
	if err := json.Unmarshal(body, &req); err != nil {
		fmt.Println("ошибка:", err)
		return
	}
	fmt.Printf("%+v\\n", req)
}`],
 ['out','{Name:Аня Age:0}'],
 ['p','Возраст 0 неотличим от «не прислали». Чтобы различать эти случаи, поле делают <b>указателем</b>: у <code>*int</code> zero value это <code>nil</code>.'],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
)

type Profile struct {
	Name string §json:"name"§
	Age  *int   §json:"age"§
}

func main() {
	var a, b Profile
	json.Unmarshal([]byte(§{"name":"Аня"}§), &a)
	json.Unmarshal([]byte(§{"name":"Боря","age":0}§), &b)
	fmt.Println("Аня: возраст не прислан =", a.Age == nil)
	fmt.Println("Боря: возраст не прислан =", b.Age == nil, "значение =", *b.Age)
}`],
 ['out',`Аня: возраст не прислан = true
Боря: возраст не прислан = false значение = 0`],
 ['p','Этот приём используют в PATCH-запросах, в настройках с «не указано» и в полях, которые могут быть <code>NULL</code> в базе. Указатели подробно разберём в этапе 2.'],
 ['h','3. := и несколько переменных'],
 ['code',`package main

import "fmt"

func main() {
	a, b := 1, 2
	b, c := 3, 4 // b уже есть (получит 3), c новая: так можно
	fmt.Println(a, b, c)
}`],
 ['out','1 3 4'],
 ['p','Именно это правило позволяет в одной функции писать <code>val, err := f()</code> несколько раз подряд: <code>err</code> переиспользуется, а новая переменная слева каждый раз разная. Но оно же порождает ошибки с затенением, о них отдельная тема этого этапа.'],
 ['h','4. Неиспользованные переменные: ошибка компиляции'],
 ['code',`package main

import "fmt"

func main() {
	x := 10
	y := 20
	fmt.Println(x)
}`],
 ['out','./main.go:7:2: declared and not used: y'],
 ['p','Это не предупреждение, а ошибка: программа не соберётся. Go так заставляет убирать мёртвый код. Если значение не нужно, присвой его <code>_</code>. То же правило действует для неиспользованных импортов.'],
 ['h','5. Как называют переменные'],
 ['ul',[
  '<b>camelCase</b>: <code>userID</code>, <code>maxRetries</code>. Подчёркивания в именах не принято.',
  '<b>Чем меньше область видимости, тем короче имя</b>: <code>i</code> в цикле, <code>err</code> для ошибки, <code>ctx</code> для контекста, <code>u</code> для пользователя в трёхстрочной функции.',
  '<b>Аббревиатуры пишут одним регистром</b>: <code>userID</code>, <code>HTTPClient</code>, а не <code>userId</code>.',
  '<b>Регистр первой буквы определяет видимость</b> за пределами пакета: <code>Name</code> видно снаружи, <code>name</code> только внутри.']],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>declared and not used</code>','Убери переменную или используй её'],
  ['<code>non-declaration statement outside function body</code>','<code>:=</code> на уровне пакета: замени на <code>var</code>'],
  ['<code>no new variables on left side of :=</code>','Все переменные слева уже существуют: используй <code>=</code>'],
  ['Поле в JSON «не пришло», а в коде 0','Это zero value. Нужен указатель или отдельный флаг']]],
 ['h','7. Практика'],
 ['ol',[
  'Объяви переменные всех базовых типов без значений и выведи их через <code>fmt.Printf("%v %q\\n", x, x)</code>.',
  'Создай структуру с полями разных типов, выведи через <code>%+v</code> и убедись, что все поля получили zero value.',
  'Воспроизведи ошибки из таблицы: <code>declared and not used</code>, <code>:=</code> вне функции, <code>no new variables</code>. Прочитай текст каждой.',
  'Сделай структуру профиля с полем-указателем и отличай «прислали ноль» от «не прислали», как в примере с <code>Age</code>.']],
 ['src',[
  ['Спецификация: The zero value','https://go.dev/ref/spec#The_zero_value','Официальное определение zero value для каждого типа','en'],
  ['Спецификация: Variable declarations','https://go.dev/ref/spec#Variable_declarations','Все формы var','en'],
  ['Спецификация: Short variable declarations','https://go.dev/ref/spec#Short_variable_declarations','Точные правила :=','en'],
  ['A Tour of Go: Zero values','https://go.dev/tour/basics/12','Интерактивный урок, можно править код в браузере','en'],
  ['Go by Example: Variables','https://gobyexample.com/variables','Короткий пример на все формы объявления','en'],
  ['Effective Go: Names','https://go.dev/doc/effective_go#names','Как принято называть в Go','en']]]],
 q:[["Какое значение у неинициализированного int, string, bool, указателя?","0, пустая строка, false, nil."],["Где можно использовать :=?","Только внутри функции. На уровне пакета нужен var."],["Что нужно, чтобы слева от := были уже существующие переменные?","Хотя бы одна новая переменная слева. Остальные получат новое значение."],["Почему в JSON-структуре не отличить «прислали 0» от «не прислали»?","Оба случая дают zero value. Нужен указатель (*int), у него отсутствие значения это nil."],["Что будет с объявленной, но неиспользованной переменной?","Ошибка компиляции declared and not used."]],
 l:[["doc","Спецификация: The zero value","https://go.dev/ref/spec#The_zero_value","en"],["trainer","A Tour of Go: Zero values","https://go.dev/tour/basics/12","en"],["doc","Effective Go: Names","https://go.dev/doc/effective_go#names","en"]]},

"s1-1":{b:[
 ['p',`Типы в Go <b>строгие</b>: компилятор не преобразует число в строку или int в float за тебя. Это раздражает первую неделю, а потом спасает от целого класса багов. Здесь главное: какие бывают базовые типы, как преобразовывать между ними и где подстерегают ловушки (целочисленное деление, переполнение, деньги во float).`],
 ['real',5,'каждый день',[
  '<b>Параметры запроса приходят строками</b> (<code>?page=3&limit=20</code>), и их постоянно превращают в числа через <code>strconv</code>.',
  '<b>Деньги</b> хранят в целых числах (копейках), а не во float: иначе копейки «плывут».',
  '<b>int и int64</b> смешивают постоянно: идентификаторы в базе чаще <code>int64</code>, а длина среза всегда <code>int</code>. Компилятор требует явного приведения.',
  '<b>Вывод для логов</b> форматируют через <code>fmt.Sprintf</code> с глаголами <code>%d %s %v %q</code>.']],
 ['h','1. Какие бывают типы'],
 ['tbl',['Тип','Для чего','Примечание'],[
  ['<code>int</code>','Обычные целые, длины, счётчики, индексы','Размер зависит от платформы: 64 бита на современных компьютерах'],
  ['<code>int8 … int64</code>, <code>uint8 … uint64</code>','Когда важен точный размер: протоколы, база, хэши','<code>uint</code> нужен реже, чем кажется'],
  ['<code>byte</code>','Один байт','Синоним <code>uint8</code>'],
  ['<code>rune</code>','Один символ Unicode','Синоним <code>int32</code>'],
  ['<code>float64</code>','Дробные числа, физические расчёты','<code>float32</code> почти не используют'],
  ['<code>string</code>','Текст','Неизменяемая последовательность байтов'],
  ['<code>bool</code>','true / false','Нельзя использовать число вместо условия']]],
 ['code',`package main

import "fmt"

func main() {
	var a int = 7
	var b float64 = 2
	fmt.Println(a/2, float64(a)/b, a%2)

	var big int64 = 1 << 40
	fmt.Println(big, int32(big))

	fmt.Printf("%T %T %T %T %T\\n", a, b, "s", true, 'я')
}`],
 ['out',`3 3.5 1
1099511627776 0
int float64 string bool int32`],
 ['ul',[
  '<code>7 / 2</code> для целых даёт <b>3</b>: дробная часть отбрасывается. Чтобы получить 3.5, хотя бы одно число должно быть float64.',
  'При уменьшении размера значение может <b>тихо обрезаться</b>: <code>int32(big)</code> выше дал 0, и никакой ошибки нет.',
  'Символ в одинарных кавычках (<code>\'я\'</code>) это <code>rune</code>, а не строка.']],
 ['h','2. Приведение типов: только явное'],
 ['code',`package main

import "fmt"

func main() {
	a := 7
	var f float64 = a
	fmt.Println(f)
}`],
 ['out','./main.go:7:18: cannot use a (variable of type int) as float64 value in variable declaration'],
 ['p','Исправление: <code>var f float64 = float64(a)</code>. Запись <code>тип(значение)</code> работает для чисел между собой. Для строк и чисел нужны функции пакета <code>strconv</code>: <code>int("5")</code> не работает, а <code>string(65)</code> вернёт символ «A», а не «65».'],
 ['h','3. Строки и числа: strconv'],
 ['code',`package main

import (
	"fmt"
	"strconv"
)

// parsePage читает номер страницы из параметра запроса.
func parsePage(raw string) int {
	if raw == "" {
		return 1
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n < 1 {
		return 1
	}
	return n
}

func main() {
	fmt.Println(parsePage(""), parsePage("3"), parsePage("abc"), parsePage("-5"))
	fmt.Println(strconv.Itoa(42) + " штук")
}`],
 ['out',`1 3 1 1
42 штук`],
 ['case','Параметр ?page= из запроса',[
  '<p>Практически в каждом API есть пагинация. Параметр <code>page</code> приходит строкой, а пользователь может прислать пустоту, буквы или отрицательное число. Функция <code>parsePage</code> выше показывает рабочий шаблон: пустое значение или ошибка превращаются в значение по умолчанию. Ты увидишь такую функцию почти в любом сервисе.</p>',
  '<p>Ошибку <code>strconv.Atoi</code> всегда проверяют: если строка не число, она вернёт 0 и ошибку, и без проверки получится «страница 0».</p>']],
 ['tbl',['Функция','Что делает'],[
  ['<code>strconv.Atoi("42")</code>','Строка в int, возвращает (число, ошибка)'],
  ['<code>strconv.Itoa(42)</code>','int в строку'],
  ['<code>strconv.ParseInt(s, 10, 64)</code>','Строка в int64 (основание и размер)'],
  ['<code>strconv.ParseFloat(s, 64)</code>','Строка в float64'],
  ['<code>strconv.ParseBool(s)</code>','"true", "1", "false" и т. д. в bool'],
  ['<code>strconv.FormatInt(n, 2)</code>','Число в строку в другой системе счисления']]],
 ['h','4. Деньги и float: почему копейки'],
 ['code',`package main

import "fmt"

func main() {
	a, b := 0.1, 0.2
	fmt.Println(a + b)

	price := 1999 // копеек
	qty := 3
	total := price * qty
	fmt.Printf("%d.%02d руб.\\n", total/100, total%100)
}`],
 ['out',`0.30000000000000004
59.97 руб.`],
 ['warn','Дробные числа хранятся в двоичном виде, и многие десятичные значения (0.1, 0.2) точно представить нельзя. Для денег используют <b>целые числа в минимальных единицах</b> (копейки, центы) или специальные десятичные типы из библиотек. float64 для денег считается ошибкой на ревью.'],
 ['h','5. Глаголы форматирования'],
 ['tbl',['Глагол','Что печатает','Пример'],[
  ['<code>%v</code>','Значение в формате по умолчанию','<code>fmt.Printf("%v", 42)</code>'],
  ['<code>%+v</code>','Структура с именами полей','<code>{Name:Аня Age:0}</code>'],
  ['<code>%d</code>','Целое число','<code>42</code>'],
  ['<code>%.2f</code>','Дробное с двумя знаками','<code>3.14</code>'],
  ['<code>%s</code>','Строка','<code>привет</code>'],
  ['<code>%q</code>','Строка в кавычках, видны скрытые символы','<code>"привет\\n"</code>'],
  ['<code>%T</code>','Тип значения','<code>int</code>'],
  ['<code>%x</code>','Шестнадцатеричное представление','<code>ff</code>']]],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>cannot use a (variable of type int) as float64 value</code>','Нужно явное приведение <code>float64(a)</code>'],
  ['<code>mismatched types int and int64</code>','Приведи одну из сторон: <code>int64(x)</code> или <code>int(y)</code>'],
  ['Деление дало 0 вместо дроби','Целочисленное деление. Приведи к float64 до деления, а не после'],
  ['После <code>Atoi</code> получился 0 без ошибки','Ошибку не проверили или проверили не ту переменную']]],
 ['h','7. Практика'],
 ['ol',[
  'Напиши функции <code>parseLimit(raw string) int</code> (по умолчанию 20, максимум 100) и <code>parseID(raw string) (int64, error)</code>.',
  'Посчитай среднее из трёх целых чисел с дробным результатом, не потеряв дробную часть.',
  'Сделай функцию, которая принимает цену в копейках и количество и печатает сумму в формате «12.30 руб.».',
  'Вызови <code>%T</code> для разных литералов: <code>1</code>, <code>1.0</code>, <code>\'a\'</code>, <code>"a"</code>, <code>1 + 2.5</code>, и объясни результаты.']],
 ['src',[
  ['Спецификация: Numeric types','https://go.dev/ref/spec#Numeric_types','Размеры и диапазоны всех числовых типов','en'],
  ['Спецификация: Conversions','https://go.dev/ref/spec#Conversions','Правила явных преобразований','en'],
  ['Документация пакета strconv','https://pkg.go.dev/strconv','Все функции разбора и форматирования','en'],
  ['Документация пакета fmt','https://pkg.go.dev/fmt','Полный список глаголов форматирования','en'],
  ['A Tour of Go: Type conversions','https://go.dev/tour/basics/13','Интерактивный урок','en'],
  ['Go by Example: Number Parsing','https://gobyexample.com/number-parsing','Примеры ParseFloat, ParseInt, Atoi','en']]]],
 q:[["Почему 7 / 2 даёт 3?","Это целочисленное деление, дробная часть отбрасывается."],["Как получить 3.5 из 7 / 2?","Привести одно число к float64: float64(7) / 2."],["Почему деньги не хранят во float?","Дробные числа неточны: 0.1 + 0.2 не равно 0.3. Используют целые копейки."],["Чем strconv.Atoi отличается от int(\"5\")?","int(\"5\") не работает: строку в число превращает только strconv, и он возвращает ошибку."],["Что делает %T в Printf?","Печатает тип значения."]],
 l:[["doc","Документация strconv","https://pkg.go.dev/strconv","en"],["doc","Документация fmt","https://pkg.go.dev/fmt","en"],["trainer","A Tour of Go: Type conversions","https://go.dev/tour/basics/13","en"],["doc","Go by Example: Number Parsing","https://gobyexample.com/number-parsing","en"]]},

"s1-2":{b:[
 ['p',`Константа это значение, которое известно при компиляции и не меняется. В Go константы заметно отличаются от «иммутабельных переменных» других языков: они бывают <b>без типа</b>, считаются с произвольной точностью и умеют <code>iota</code> для перечислений. Если в коде встречается «магическое число» или строка, которая повторяется, её скорее всего надо вынести в константу.`],
 ['real',4,'очень часто',[
  '<b>Статусы и роли</b>: статус заказа (новый, оплачен, отправлен), роль пользователя (админ, гость) задают константами с <code>iota</code>.',
  '<b>Настройки по умолчанию</b>: размер страницы, таймаут, максимальная длина имени.',
  '<b>Тайм-ауты</b> записывают как <code>5 * time.Second</code>, а не числом.',
  '<b>Права и флаги</b>: битовые маски через <code>1 &lt;&lt; iota</code>.',
  '<b>Имена заголовков, ключей, пути</b>: всё, что в коде повторяется строкой, лучше сделать константой, чтобы не ошибиться в опечатке.']],
 ['h','1. Объявление'],
 ['code',`const Pi = 3.14159
const AppName = "tasks"

const (
	MaxNameLen = 50
	DefaultPage = 1
)`],
 ['ul',[
  'Константы объявляют через <code>const</code>, <code>:=</code> для них не работает.',
  'Значение должно быть известно на этапе компиляции: число, строка, bool, результат выражения из других констант.',
  '<b>Константой нельзя сделать срез, map, структуру или результат вызова функции.</b> Для них остаётся <code>var</code>.',
  'У константы нельзя взять адрес: <code>&amp;Pi</code> даст ошибку.']],
 ['h','2. Константы без типа: точность и гибкость'],
 ['code',`package main

import (
	"fmt"
	"time"
)

const big = 1 << 100 // слишком велико для любого int, но как константа допустимо

func main() {
	fmt.Println(big >> 98) // вычисляется точно: 4

	const rate = 2.5
	n := 4
	fmt.Println(float64(n) * rate) // rate подстроился под float64

	const timeout = 5 * time.Second
	fmt.Println(timeout, timeout.Seconds())
}`],
 ['out',`4
10
5s 5`],
 ['p','Константа без явного типа подстраивается под контекст, где её используют. Поэтому <code>2 * time.Second</code> работает, а <code>n * time.Second</code> при <code>n int</code> нет: переменная уже имеет жёсткий тип, и придётся писать <code>time.Duration(n) * time.Second</code>.'],
 ['h','3. iota: перечисления'],
 ['p','В Go нет ключевого слова <code>enum</code>. Вместо него используют именованный тип и блок констант с <code>iota</code>: он начинается с 0 и увеличивается на 1 в каждой следующей строке блока.'],
 ['code',`package main

import "fmt"

type OrderStatus int

const (
	StatusNew OrderStatus = iota
	StatusPaid
	StatusShipped
	StatusDone
)

func statusText(s OrderStatus) string {
	switch s {
	case StatusNew:
		return "новый"
	case StatusPaid:
		return "оплачен"
	case StatusShipped:
		return "отправлен"
	case StatusDone:
		return "доставлен"
	default:
		return "неизвестно"
	}
}

func main() {
	fmt.Println(StatusNew, StatusPaid, StatusShipped, StatusDone)
	fmt.Println(statusText(StatusPaid), statusText(OrderStatus(9)))
}`],
 ['out',`0 1 2 3
оплачен неизвестно`],
 ['case','Статусы заказа в интернет-магазине',[
  '<p>В таблице <code>orders</code> в базе хранится число: 0, 1, 2, 3. В коде вместо магических чисел используют именованные константы, и тогда <code>if order.Status == StatusPaid</code> читается как текст, а опечатку поймает компилятор. На собеседованиях по Go просят показать <code>iota</code> почти всегда.</p>',
  '<p>В следующих этапах к типу <code>OrderStatus</code> добавят метод <code>String()</code>, и <code>fmt.Println(StatusPaid)</code> начнёт печатать «оплачен» сам.</p>']],
 ['h','4. Приёмы с iota'],
 ['code',`package main

import "fmt"

const (
	Read = 1 << iota // 1
	Write            // 2
	Delete           // 4
)

const (
	_  = iota
	KB = 1 << (10 * iota) // 1024
	MB                    // 1048576
)

func main() {
	perm := Read | Write
	fmt.Println(perm, perm&Write != 0, perm&Delete != 0)
	fmt.Println(KB, MB)
}`],
 ['out',`3 true false
1024 1048576`],
 ['ul',[
  '<code>1 &lt;&lt; iota</code> даёт степени двойки: удобно для <b>флагов и прав</b>, которые складывают оператором <code>|</code> и проверяют через <code>&amp;</code>.',
  '<code>_ = iota</code> пропускает нулевое значение. Так делают, если 0 должен значить «не задано» и не быть настоящим статусом.',
  'Выражение в первой строке блока повторяется для следующих строк, а <code>iota</code> растёт.']],
 ['h','5. Частые ошибки'],
 ['code',`package main

import "fmt"

func main() {
	const x = 5
	p := &x
	fmt.Println(p)
}`],
 ['out','./main.go:7:8: invalid operation: cannot take address of x (untyped int constant 5)'],
 ['tbl',['Что случилось','Что делать'],[
  ['<code>cannot take address of ...</code>','Констант в памяти нет: возьми <code>var</code>'],
  ['<code>... (value of type []int) is not constant</code>','Срезы и map константами не бывают. Объяви <code>var</code>'],
  ['<code>mismatched types int and time.Duration</code>','Приведи число: <code>time.Duration(n) * time.Second</code>'],
  ['Новый статус вставили в середину блока iota','Сломались все числа после него, а они лежат в базе. Новые значения всегда добавляй в конец']]],
 ['warn','Если числа от <code>iota</code> сохраняются в базу или уходят клиенту, <b>порядок констант менять нельзя</b>. Это частая причина странных багов после «аккуратного рефакторинга».'],
 ['h','6. Практика'],
 ['ol',[
  'Задай тип <code>Role</code> с константами <code>Guest</code>, <code>User</code>, <code>Admin</code> через <code>iota</code> и функцию <code>canDelete(r Role) bool</code>.',
  'Сделай права <code>Read</code>, <code>Write</code>, <code>Delete</code> через <code>1 &lt;&lt; iota</code>, выдай пользователю два права и проверь третье.',
  'Вынеси из программы все числа и строки, которые повторяются, в константы.',
  'Объясни, почему <code>5 * time.Second</code> компилируется, а при <code>n := 5</code> запись <code>n * time.Second</code> нет.']],
 ['src',[
  ['Спецификация: Constants','https://go.dev/ref/spec#Constants','Типизированные и нетипизированные константы','en'],
  ['Спецификация: Iota','https://go.dev/ref/spec#Iota','Точные правила iota с примерами','en'],
  ['A Tour of Go: Constants','https://go.dev/tour/basics/15','Интерактивный урок','en'],
  ['Go by Example: Constants','https://gobyexample.com/constants','Короткий пример','en'],
  ['Effective Go: Constants','https://go.dev/doc/effective_go#constants','Как принято использовать iota','en'],
  ['Go Wiki: Iota','https://go.dev/wiki/Iota','Приёмы с iota для перечислений и флагов','en']]]],
 q:[["Чем константа отличается от переменной?","Значение известно при компиляции и не меняется, и у неё может не быть типа."],["Что делает iota?","Начинается с 0 и увеличивается на 1 в каждой строке блока const."],["Зачем писать _ = iota?","Чтобы пропустить нулевое значение, оно остаётся незанятым."],["Можно ли объявить срез константой?","Нет. Только числа, строки, bool и выражения из них."],["Почему нельзя менять порядок констант iota?","Числа могут быть уже сохранены в базе или отправлены клиентам, и значения «поедут»."]],
 l:[["doc","Спецификация: Iota","https://go.dev/ref/spec#Iota","en"],["doc","Go Wiki: Iota","https://go.dev/wiki/Iota","en"],["trainer","A Tour of Go: Constants","https://go.dev/tour/basics/15","en"]]},

"s1-3":{b:[
 ['p',`Ветвление в Go устроено проще, чем в большинстве языков: скобки вокруг условия не нужны, у <code>switch</code> нет проваливания, а у <code>if</code> есть своё короткое объявление. Эти две конструкции формируют «скелет» любого обработчика и любой проверки данных.`],
 ['real',5,'каждый день',[
  '<b>Валидация</b> входных данных: цепочка <code>if</code> с ранним выходом, почти в каждой функции обработчика.',
  '<b>Обработка ошибок</b>: <code>if err != nil { return err }</code> встречается в Go-коде тысячи раз.',
  '<b>switch</b> по статусу, типу события, HTTP-методу, команде.',
  '<b>Короткий if</b> с объявлением: <code>if v, ok := m[key]; ok { ... }</code> для проверки наличия в map.']],
 ['h','1. if / else if / else'],
 ['code',`package main

import (
	"errors"
	"fmt"
)

func validateAge(age int) error {
	if age < 0 {
		return errors.New("возраст не может быть отрицательным")
	}
	if age > 150 {
		return errors.New("возраст слишком большой")
	}
	return nil
}

func main() {
	for _, age := range []int{-1, 30, 200} {
		if err := validateAge(age); err != nil {
			fmt.Println(age, "ошибка:", err)
		} else {
			fmt.Println(age, "ок")
		}
	}
}`],
 ['out',`-1 ошибка: возраст не может быть отрицательным
30 ок
200 ошибка: возраст слишком большой`],
 ['ul',[
  'Скобки вокруг условия не нужны, а фигурные скобки обязательны, даже для одной строки.',
  '<code>else</code> ставят на той же строке, что и закрывающая скобка: <code>} else {</code>.',
  '<b>Короткое объявление</b>: <code>if err := validateAge(x); err != nil</code>. Переменная живёт только внутри блока if/else, поэтому <code>err</code> не «засоряет» функцию.']],
 ['case','Ранний выход вместо вложенных if',[
  '<p>В Go принято проверять «плохие» случаи в начале и выходить сразу (<code>return</code>), а основную логику оставлять без вложенности. Это называют guard clauses. Функция <code>validateAge</code> выше устроена именно так: нет ни одного <code>else</code> после <code>return</code>.</p>',
  '<p>Так читать код проще: «тут отбрасываем плохое, дальше рабочий путь». Линтеры подсветят лишний <code>else</code> после <code>return</code> как замечание.</p>']],
 ['h','2. switch'],
 ['code',`package main

import "fmt"

func statusText(code int) string {
	switch {
	case code >= 200 && code < 300:
		return "успех"
	case code == 404:
		return "не найдено"
	case code >= 400 && code < 500:
		return "ошибка клиента"
	case code >= 500:
		return "ошибка сервера"
	default:
		return "другое"
	}
}

func main() {
	for _, c := range []int{200, 404, 418, 503, 302} {
		fmt.Println(c, statusText(c))
	}

	switch day := "сб"; day {
	case "сб", "вс":
		fmt.Println("выходной")
	default:
		fmt.Println("рабочий")
	}
}`],
 ['out',`200 успех
404 не найдено
418 ошибка клиента
503 ошибка сервера
302 другое
выходной`],
 ['ul',[
  '<b>break писать не нужно</b>: после выполнения ветки switch заканчивается сам. Если нужно провалиться в следующую ветку, пишут <code>fallthrough</code>, но это делают очень редко.',
  '<b>Несколько значений в одной ветке</b> через запятую: <code>case "сб", "вс":</code>.',
  '<b>switch без выражения</b> (<code>switch {</code>) заменяет цепочку <code>if / else if</code>. Ветки проверяются сверху вниз, срабатывает первая подошедшая, поэтому порядок важен.',
  'Ветка <code>default</code> необязательна и может стоять где угодно, но принято ставить последней.']],
 ['h','3. Логические операторы и проверка на nil'],
 ['code',`package main

import "fmt"

func describe(name *string) string {
	if name != nil && *name != "" {
		return "имя: " + *name
	}
	return "имя не задано"
}

func main() {
	var empty *string
	n := "Аня"
	fmt.Println(describe(empty))
	fmt.Println(describe(&n))
}`],
 ['out',`имя не задано
имя: Аня`],
 ['p','Операторы <code>&amp;&amp;</code> и <code>||</code> работают «коротким замыканием»: если результат уже ясен, вторая часть не вычисляется. Поэтому <code>name != nil &amp;&amp; *name != ""</code> безопасно: до разыменования дело дойдёт только если указатель не nil. Поменяй части местами, и получишь панику.'],
 ['h','4. Сравнения'],
 ['tbl',['Оператор','Смысл'],[
  ['<code>==</code>, <code>!=</code>','Равно, не равно. Можно сравнивать числа, строки, bool, указатели, структуры из сравнимых полей'],
  ['<code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>','Порядок для чисел и строк (строки сравниваются побайтово)'],
  ['<code>&amp;&amp;</code>, <code>||</code>, <code>!</code>','И, или, не'],
  ['срезы, map, функции','Сравнивать через <code>==</code> нельзя, только с <code>nil</code>']]],
 ['h','5. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>syntax error: unexpected newline, expected { after if clause</code>','Открывающая скобка не на той же строке, что и if'],
  ['Лишний <code>else</code> после <code>return</code>','Не ошибка, но шум: убери else и выведи код из блока'],
  ['Условие <code>if x = 5</code>','В Go присваивание не выражение: пиши <code>==</code>'],
  ['Ожидали провал в следующую ветку, а его нет','В Go switch не проваливается. Объедини значения через запятую или используй fallthrough']]],
 ['h','6. Практика'],
 ['ol',[
  'Напиши <code>grade(score int) string</code>: «неуд», «уд», «хор», «отл» по баллам, через switch без выражения.',
  'Сделай функцию валидации пароля: длина не меньше 8, есть цифра. Используй ранние выходы и верни ошибку с понятным текстом.',
  'Через switch реализуй определение дня недели по номеру 1-7 с общей веткой для выходных.',
  'Сломай порядок веток в <code>statusText</code> (поставь <code>code &gt;= 400 &amp;&amp; code &lt; 500</code> выше проверки 404) и посмотри, что изменится.']],
 ['src',[
  ['Спецификация: If statements','https://go.dev/ref/spec#If_statements','Формальные правила, включая короткое объявление','en'],
  ['Спецификация: Switch statements','https://go.dev/ref/spec#Switch_statements','Выражения, типы и fallthrough','en'],
  ['Effective Go: Control structures','https://go.dev/doc/effective_go#control-structures','Идиоматичные if, for, switch','en'],
  ['A Tour of Go: Flow control','https://go.dev/tour/flowcontrol/5','Интерактивные уроки по if и switch','en'],
  ['Go by Example: If/Else','https://gobyexample.com/if-else','Короткий пример','en'],
  ['Go by Example: Switch','https://gobyexample.com/switch','Короткий пример','en']]]],
 q:[["Нужны ли скобки вокруг условия в if?","Нет, а фигурные скобки обязательны."],["Что делает короткое объявление в if?","Объявляет переменную, которая видна только внутри if и else."],["Нужен ли break в switch?","Нет, ветка заканчивается сама. Провалиться дальше можно через fallthrough."],["Чем switch без выражения лучше цепочки if?","Читается как таблица условий: ветки проверяются сверху вниз."],["Почему name != nil && *name != \"\" безопасно?","&& проверяет вторую часть, только если первая истинна, до разыменования nil не дойдёт."]],
 l:[["doc","Effective Go: Control structures","https://go.dev/doc/effective_go#control-structures","en"],["trainer","A Tour of Go: Flow control","https://go.dev/tour/flowcontrol/5","en"],["trainer","Go by Example: If/Else","https://gobyexample.com/if-else","en"],["trainer","Go by Example: Switch","https://gobyexample.com/switch","en"]]},

"s1-4":{b:[
 ['p',`В Go только <b>одно ключевое слово цикла</b>: <code>for</code>. Оно заменяет и <code>for</code>, и <code>while</code>, и <code>foreach</code> других языков. У него четыре формы, и вместе с <code>range</code> они покрывают любой обход данных.`],
 ['real',5,'каждый день',[
  '<b>Обход результатов</b> запроса к базе: прочитать строки, собрать список.',
  '<b>Обработка списка</b> из запроса: проверить каждый элемент, преобразовать, отфильтровать.',
  '<b>Повторные попытки</b> (retry) вызова внешнего сервиса с паузой.',
  '<b>Бесконечный цикл</b> внутри горутин и воркеров: «ждём задачу, обрабатываем, ждём следующую».',
  '<b>Пагинация</b>: идём по страницам, пока они не кончатся.']],
 ['h','1. Четыре формы for'],
 ['code',`package main

import "fmt"

func main() {
	// 1. классический, как в C
	for i := 0; i < 3; i++ {
		fmt.Print(i, " ")
	}
	fmt.Println()

	// 2. «while»: только условие
	n := 3
	for n > 0 {
		fmt.Print(n, " ")
		n--
	}
	fmt.Println()

	// 3. бесконечный: выход через break
	k := 0
	for {
		k++
		if k == 3 {
			break
		}
	}
	fmt.Println("k =", k)

	// 4. range по срезу, строке и числу
	for i, v := range []string{"a", "b"} {
		fmt.Print(i, "=", v, " ")
	}
	fmt.Println()
	for i, r := range "Гоу" {
		fmt.Print(i, ":", string(r), " ")
	}
	fmt.Println()
	for i := range 3 {
		fmt.Print(i, " ")
	}
	fmt.Println()
}`],
 ['out',`0 1 2
3 2 1
k = 3
0=a 1=b
0:Г 2:о 4:у
0 1 2 `],
 ['ul',[
  '<code>range</code> по срезу отдаёт <b>индекс и значение</b>. Не нужен индекс: <code>for _, v := range xs</code>. Не нужно значение: <code>for i := range xs</code>.',
  '<code>range</code> по строке идёт по <b>рунам</b>, а индекс это позиция в байтах: у кириллицы шаг 2.',
  '<code>range 3</code> (с Go 1.22) даёт 0, 1, 2: простейший счётчик без лишнего синтаксиса.',
  '<code>range</code> по map обходит ключи в <b>случайном порядке</b>: порядок специально перемешивают, чтобы никто на него не полагался. Если нужен порядок, ключи собирают в срез и сортируют (об этом в теме про map).']],
 ['h','2. break, continue и метки'],
 ['code',`package main

import "fmt"

func main() {
outer:
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if j == 2 {
				continue outer // к следующему i
			}
			if i == 2 {
				break outer // выйти из обоих циклов
			}
			fmt.Println(i, j)
		}
	}
}`],
 ['out',`0 0
0 1
1 0
1 1`],
 ['p','<code>break</code> выходит из цикла, <code>continue</code> переходит к следующей итерации. Метка (<code>outer:</code>) нужна, когда надо управлять внешним циклом из внутреннего. Метки применяют редко, но в разборе вложенных обходов они чистят код.'],
 ['h','3. Переменная цикла и замыкания'],
 ['code',`package main

import "fmt"

func main() {
	var fs []func()
	for i := 0; i < 3; i++ {
		fs = append(fs, func() { fmt.Print(i, " ") })
	}
	for _, f := range fs {
		f()
	}
	fmt.Println()
}`],
 ['out','0 1 2 '],
 ['warn','В Go до версии 1.22 здесь напечаталось бы <code>3 3 3</code>: все функции делили одну переменную <code>i</code>. Начиная с 1.22 у каждой итерации <b>своя</b> копия. Старые проекты ещё встречаются, поэтому в чужом коде ты можешь увидеть обходной приём <code>i := i</code> внутри цикла.'],
 ['case','Повторные попытки с растущей паузой (retry)',[
  '<p>Внешний сервис иногда отвечает ошибкой, и вместо падения вызов повторяют несколько раз с растущей паузой. Это один из самых частых «настоящих» циклов в сервисах:</p>']],
 ['code',`package main

import (
	"errors"
	"fmt"
	"time"
)

func fakeCall(n int) error {
	if n < 3 {
		return errors.New("временная ошибка")
	}
	return nil
}

func main() {
	const maxAttempts = 5
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err := fakeCall(attempt)
		if err == nil {
			fmt.Println("попытка", attempt, ": успех")
			break
		}
		delay := time.Duration(1<<attempt) * 100 * time.Millisecond
		fmt.Println("попытка", attempt, ": ошибка, пауза", delay)
		// time.Sleep(delay) в настоящем коде
	}
}`],
 ['out',`попытка 1 : ошибка, пауза 200ms
попытка 2 : ошибка, пауза 400ms
попытка 3 : успех`],
 ['case','Пагинация: идём по страницам, пока они не кончатся',[
  '<p>Внешний API отдаёт данные порциями по 10 записей. Цикл с шагом по смещению (offset) забирает всё:</p>']],
 ['code',`package main

import "fmt"

func main() {
	total, limit := 25, 10
	for offset := 0; offset < total; offset += limit {
		end := offset + limit
		if end > total {
			end = total
		}
		fmt.Printf("страница %d: записи %d-%d\\n", offset/limit+1, offset, end-1)
	}
}`],
 ['out',`страница 1: записи 0-9
страница 2: записи 10-19
страница 3: записи 20-24`],
 ['h','4. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>declared and not used: i</code> в <code>for i, v := range</code>','Индекс не нужен: замени на <code>_</code>'],
  ['Бесконечный цикл','Забыл изменить условие или break: проверь, что что-то в теле приближает выход'],
  ['Изменяешь срез, пока по нему идёшь','Лучше собрать результат в новый срез. Правки на месте требуют аккуратности'],
  ['Ожидаешь порядок при обходе map','Порядок случаен: сортируй ключи'],
  ['Все замыкания видят одно значение','Версия Go до 1.22. Обновись или скопируй: <code>i := i</code>']]],
 ['h','5. Практика'],
 ['ol',[
  'Выведи таблицу умножения 9×9 вложенными циклами.',
  'Найди первое число от 1 до 1000, которое делится на 7 и на 13, остановись через <code>break</code>.',
  'Напиши <code>retry(maxAttempts int, f func() error) error</code>, которая вызывает <code>f</code> до успеха.',
  'Посчитай количество гласных в строке с кириллицей через <code>range</code> и убедись, что считаются руны, а не байты.']],
 ['src',[
  ['Спецификация: For statements','https://go.dev/ref/spec#For_statements','Формальное описание всех форм и range','en'],
  ['Effective Go: For','https://go.dev/doc/effective_go#for','Идиоматичное использование for и range','en'],
  ['Go 1.22: loopvar (блог Go)','https://go.dev/blog/loopvar-preview','Почему у каждой итерации теперь своя переменная','en'],
  ['A Tour of Go: For','https://go.dev/tour/flowcontrol/1','Интерактивный урок','en'],
  ['Go by Example: For','https://gobyexample.com/for','Все формы for на коротких примерах','en'],
  ['Go by Example: Range','https://gobyexample.com/range','Range по срезам, map и строкам','en']]]],
 q:[["Какие формы у for в Go?","Классическая, только условие (как while), бесконечная и range."],["Что отдаёт range по срезу и по строке?","По срезу индекс и значение, по строке позицию в байтах и руну."],["Как выйти из внешнего цикла из внутреннего?","break с меткой внешнего цикла."],["Почему порядок обхода map нельзя использовать?","Он намеренно случайный и меняется от запуска к запуску."],["Что изменилось в Go 1.22 для переменной цикла?","У каждой итерации своя копия переменной, замыкания больше не делят одно значение."]],
 l:[["doc","Effective Go: For","https://go.dev/doc/effective_go#for","en"],["trainer","A Tour of Go: For","https://go.dev/tour/flowcontrol/1","en"],["art","Go 1.22: loopvar (блог Go)","https://go.dev/blog/loopvar-preview","en"],["trainer","Go by Example: Range","https://gobyexample.com/range","en"]]}
});
