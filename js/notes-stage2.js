// Конспекты этапа 2 (часть 1). «§» в коде означает обратную кавычку.
mergeNotes({
"s2-0":{b:[
 ['p',`<b>Указатель</b> это значение, в котором хранится <b>адрес</b> другого значения. Слово «указатель» пугает, но идея простая: вместо того чтобы отдавать функции копию, ты отдаёшь ей адрес, и она работает с оригиналом. Без указателей в Go не обходится ни один реальный проект: на них построены методы, работа с базой данных и необязательные поля.`],
 ['real',5,'каждый день',[
  '<b>Типы из стандартной библиотеки</b> почти всегда приходят указателями: <code>*http.Request</code>, <code>*sql.DB</code>, <code>*bytes.Buffer</code>, <code>*os.File</code>.',
  '<b>Методы</b>, которые меняют структуру (<code>func (s *Service) ...</code>), требуют указателя на неё.',
  '<b>Необязательные поля</b> в JSON и базе: <code>*string</code>, <code>*int</code> позволяют отличить «не прислали» от «прислали пустое».',
  '<b>Большие структуры</b> передают по указателю, чтобы не копировать их на каждый вызов.',
  '<b>nil pointer dereference</b> один из самых частых паник в продакшене. Уметь его читать обязательно.']],
 ['h','1. Адрес и значение: & и *'],
 ['code',`package main

import "fmt"

func incByValue(n int) { n++ }
func incByPointer(n *int) { *n++ }

func main() {
	x := 5
	incByValue(x)
	fmt.Println(x)

	incByPointer(&x)
	fmt.Println(x)

	p := &x // p хранит адрес x
	fmt.Println(*p, p == &x)
	*p = 100 // запись по адресу меняет сам x
	fmt.Println(x)
}`],
 ['out',`5
6
6 true
100`],
 ['tbl',['Запись','Читается как'],[
  ['<code>&x</code>','«адрес x»: получить указатель на переменную'],
  ['<code>*p</code>','«значение по адресу p»: прочитать или записать по указателю'],
  ['<code>*int</code> в типе','«указатель на int»'],
  ['<code>var p *int</code>','Указатель без адреса: <code>nil</code>']]],
 ['p','Первая функция получила <b>копию</b> числа и изменила её: оригинал не пострадал. Вторая получила адрес и изменила то, что лежит по нему. Это полный ответ на вопрос «зачем указатели».'],
 ['h','2. Указатели на структуры'],
 ['code',`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

// rename меняет оригинал, потому что получает указатель
func rename(u *User, name string) {
	u.Name = name // то же самое, что (*u).Name = name
}

// NewUser создаёт структуру и возвращает указатель на неё
func NewUser(name string) *User {
	return &User{Name: name}
}

func main() {
	u := NewUser("Аня")
	rename(u, "Анна")
	fmt.Println(u.Name, u.Age)
}`],
 ['out','Анна 0'],
 ['ul',[
  '<b>Автоматическое разыменование</b>: для указателя на структуру пишут <code>u.Name</code>, а не <code>(*u).Name</code>. Go подставит звёздочку сам.',
  '<code>&amp;User{...}</code> создаёт структуру и сразу берёт указатель: самая частая форма конструктора.',
  'Вернуть указатель на локальную переменную безопасно: Go сам перенесёт значение туда, где оно переживёт функцию (это называется «escape analysis»). Как в C, «висячих» указателей не бывает.',
  '<b>Арифметики указателей нет</b>: указатель нельзя «сдвинуть на 4 байта». Это сознательное упрощение.']],
 ['h','3. nil и паника'],
 ['code',`package main

import "fmt"

type User struct{ Name string }

func main() {
	var u *User
	fmt.Println(u == nil)
	fmt.Println(u.Name)
}`],
 ['out',`true
panic: runtime error: invalid memory address or nil pointer dereference
…`],
 ['p','Обращение к полю через <code>nil</code>-указатель приводит к панике и падению программы. В логе рядом будет строка с файлом и номером строки: по ней сразу видно, где указатель оказался пустым. Лечится проверкой <code>if u == nil</code> до использования или конструктором, который никогда не возвращает nil без ошибки.'],
 ['case','Частичное обновление (PATCH)',[
  '<p>Клиент присылает только те поля профиля, которые хочет изменить. Если имя не прислали, трогать его нельзя, а если прислали пустое, надо очистить. Обычным <code>string</code> это не различить, поэтому в структуру запроса кладут указатели:</p>']],
 ['code',`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

type UserPatch struct {
	Name *string
	Age  *int
}

func apply(u *User, p UserPatch) {
	if p.Name != nil {
		u.Name = *p.Name
	}
	if p.Age != nil {
		u.Age = *p.Age
	}
}

func main() {
	u := User{Name: "Аня", Age: 25}
	newAge := 26
	apply(&u, UserPatch{Age: &newAge})
	fmt.Printf("%+v\\n", u)
}`],
 ['out','{Name:Аня Age:26}'],
 ['h','4. Когда указатель, а когда значение'],
 ['tbl',['Ситуация','Что выбрать'],[
  ['Функция должна изменить аргумент','Указатель'],
  ['Структура большая (много полей, вложенные данные)','Указатель: не копируется на каждый вызов'],
  ['Нужно «значение может отсутствовать»','Указатель (<code>*int</code>, <code>*string</code>)'],
  ['Маленькие неизменяемые данные: числа, bool, небольшие структуры вроде точки','Значение: проще и безопаснее'],
  ['Срезы и map','Обычно значение: они сами содержат ссылку на данные, <code>*[]int</code> почти не нужен'],
  ['Метод меняет структуру или структура содержит мьютекс','Указатель на получателе (<code>func (s *T) ...</code>)']]],
 ['warn','Не оборачивай всё подряд в указатели «для скорости». Копирование небольшой структуры дешёвое, а указатели добавляют нагрузку на сборщик мусора и риск nil. Начинай со значений и переходи на указатели, когда есть причина из таблицы.'],
 ['h','5. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>panic: runtime error: invalid memory address or nil pointer dereference</code>','Указатель nil. Проверь его перед использованием, читай строку в логе'],
  ['<code>cannot use x (variable of type int) as *int value</code>','Нужно передать адрес: <code>&amp;x</code>'],
  ['<code>invalid operation: cannot indirect x</code>','Звёздочка применена не к указателю'],
  ['Изменение не «доходит» из функции','Передала значение вместо указателя. Проверь сигнатуру'],
  ['Структуры в цикле <code>for _, u := range users</code> не меняются','<code>u</code> копия. Меняй через индекс: <code>users[i].Name = ...</code>']]],
 ['h','6. Практика'],
 ['ol',[
  'Напиши <code>swap(a, b *int)</code>, которая меняет значения местами, и проверь на двух переменных.',
  'Сделай структуру <code>Product</code> и функцию <code>applyDiscount(p *Product, percent int)</code>, меняющую цену.',
  'Воспроизведи nil-панику и прочитай текст: найди в нём файл и строку.',
  'Сделай <code>UserPatch</code> с тремя необязательными полями и функцию <code>apply</code>, как в примере. Проверь все комбинации.',
  'Измени структуры в цикле <code>range</code> двумя способами: неверно (через копию) и верно (по индексу).']],
 ['src',[
  ['Спецификация: Pointer types','https://go.dev/ref/spec#Pointer_types','Формальное описание указателей и разыменования','en'],
  ['A Tour of Go: Pointers','https://go.dev/tour/moretypes/1','Интерактивный урок','en'],
  ['Go FAQ: pass by value or pointer?','https://go.dev/doc/faq#pass_by_value','Почему Go передаёт копии и как это связано с указателями','en'],
  ['Go FAQ: stack or heap','https://go.dev/doc/faq#stack_or_heap','Где Go размещает переменные и при чём тут escape analysis','en'],
  ['Effective Go: Pointers vs. Values','https://go.dev/doc/effective_go#pointers_vs_values','Как выбирать между значением и указателем','en'],
  ['Go by Example: Pointers','https://gobyexample.com/pointers','Короткий пример','en']]]],
 q:[["Что хранит указатель?","Адрес другого значения."],["Что делают & и * ?","& берёт адрес переменной, * читает или записывает значение по адресу."],["Что такое nil pointer dereference?","Обращение к значению через nil-указатель: программа паникует."],["Зачем в структуре запроса поле-указатель *int?","Чтобы отличить «поле не прислали» (nil) от «прислали 0»."],["Почему изменения структуры из цикла range не сохраняются?","Переменная цикла это копия элемента: менять надо через индекс."]],
 l:[["doc","Go FAQ: pass by value or pointer?","https://go.dev/doc/faq#pass_by_value","en"],["doc","Go FAQ: stack or heap","https://go.dev/doc/faq#stack_or_heap","en"],["doc","Effective Go: Pointers vs. Values","https://go.dev/doc/effective_go#pointers_vs_values","en"],["trainer","A Tour of Go: Pointers","https://go.dev/tour/moretypes/1","en"]]},

"s2-1":{b:[
 ['p',`Срезы (slices) это главный способ хранить списки в Go. Массивы почти не используют, а срезы встречаются в каждой программе: строки из базы, элементы ответа API, аргументы командной строки. Срез выглядит просто, но у него есть <b>механика изнутри</b> (общая память, длина и ёмкость), и непонимание её даёт самые странные баги. Разберём всё.`],
 ['real',5,'в каждой программе',[
  '<b>Результаты запроса к базе</b> собираются в срез: «прочитал строку, добавил в список».',
  '<b>Ответ API</b> со списком элементов: срез структур, который превращается в JSON-массив.',
  '<b>Параметры и аргументы</b>: <code>os.Args</code>, список ID, теги, права.',
  '<b>Пагинация</b>: «взять 20 элементов, начиная с 40-го» это срез <code>items[40:60]</code>.',
  '<b>Пакет slices</b> (с Go 1.21) закрывает типовые задачи: поиск, сортировка, вставка, удаление.']],
 ['h','1. Массив и срез'],
 ['code',`package main

import "fmt"

func main() {
	arr := [3]int{1, 2, 3} // массив: размер входит в тип, это значение
	b := arr
	b[0] = 99
	fmt.Println(arr, b)

	s := []int{1, 2, 3} // срез: размер не в типе, это «окно» в массив
	t := s
	t[0] = 99
	fmt.Println(s, t)
	fmt.Println(len(arr), len(s), cap(s))
}`],
 ['out',`[1 2 3] [99 2 3]
[99 2 3] [99 2 3]
3 3 3`],
 ['ul',[
  '<b>Массив</b> <code>[3]int</code> копируется целиком при присваивании и передаче в функцию. Размер часть типа: <code>[3]int</code> и <code>[4]int</code> разные типы.',
  '<b>Срез</b> <code>[]int</code> это небольшая структура из трёх полей: указатель на массив, <b>длина</b> (<code>len</code>) и <b>ёмкость</b> (<code>cap</code>). Копирование среза копирует эти три поля, а не данные.',
  'Поэтому <code>t := s</code> создаёт второе «окно» на те же данные: правка через <code>t</code> видна в <code>s</code>.']],
 ['code',`срез s:  [ptr | len=3 | cap=3]
           │
           ▼
массив:   [ 1 ][ 2 ][ 3 ]`],
 ['h','2. len, cap, make, append'],
 ['code',`package main

import "fmt"

func main() {
	s := make([]int, 0, 2) // длина 0, ёмкость 2
	fmt.Println(len(s), cap(s))

	s = append(s, 1, 2) // помещается в ёмкость
	fmt.Println(len(s), cap(s), s)

	s = append(s, 3) // не помещается: Go выделит новый массив побольше
	fmt.Println(len(s), cap(s) > 2)
}`],
 ['out',`0 2
2 2 [1 2]
3 true`],
 ['ul',[
  '<code>len</code> сколько элементов в срезе сейчас, <code>cap</code> сколько влезет в массив до перевыделения.',
  '<code>append</code> <b>всегда возвращает срез</b>, результат надо присвоить: <code>s = append(s, x)</code>. Без присваивания добавление потеряется.',
  'Когда место кончилось, Go выделяет новый массив (примерно вдвое больше для небольших срезов), копирует туда данные и возвращает срез на него. Именно поэтому добавление в среднем стоит <code>O(1)</code>.',
  'Заранее известно примерное число элементов? Создай срез с запасом: <code>make([]T, 0, n)</code>. Это убирает лишние перевыделения.']],
 ['h','3. Главная ловушка: общая память'],
 ['code',`package main

import "fmt"

func main() {
	a := []int{1, 2, 3, 4, 5}
	b := a[1:3] // [2 3], но cap(b) = 4: за «окном» ещё есть место в том же массиве
	b = append(b, 100)
	fmt.Println(a, b) // append записал в общий массив и затёр a[3]

	c := a[1:3:3] // «ограничить ёмкость»: cap(c) = 2
	c = append(c, 200) // места нет, получим копию
	fmt.Println(a, c)
}`],
 ['out',`[1 2 3 100 5] [2 3 100]
[1 2 3 100 5] [2 3 200]`],
 ['p','Подсрез <code>a[1:3]</code> не копирует данные, он смотрит на ту же память. Пока ёмкости хватает, <code>append</code> пишет прямо в общий массив и портит данные «соседей». Защита: если подсрез надо менять независимо, сделай копию (<code>copy</code>, <code>slices.Clone</code>) или ограничь ёмкость тройным срезом <code>a[1:3:3]</code>.'],
 ['code',`package main

import "fmt"

func main() {
	src := []int{1, 2, 3}
	dst := make([]int, len(src))
	n := copy(dst, src) // скопировать данные, не окно
	dst[0] = 9
	fmt.Println(n, src, dst)
}`],
 ['out','3 [1 2 3] [9 2 3]'],
 ['h','4. nil-срез и пустой срез: ловушка в JSON'],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	var nilS []int
	empty := []int{}
	a, _ := json.Marshal(nilS)
	b, _ := json.Marshal(empty)
	fmt.Println(string(a), string(b), nilS == nil, empty == nil, len(nilS), len(empty))
}`],
 ['out','null [] true false 0 0'],
 ['case','Почему фронтенд получает null вместо []',[
  '<p>Обработчик собирает список заказов в <code>var orders []Order</code> и добавляет в цикле. Если заказов нет, срез остался <code>nil</code>, и в JSON уходит <code>null</code>. А фронтенд ждёт массив и падает на <code>orders.map</code>. Типовое решение: создавать срез как <code>orders := []Order{}</code> или <code>make([]Order, 0)</code>, чтобы получился <code>[]</code>.</p>',
  '<p>Для самой Go <code>nil</code>-срез ведёт себя как пустой: <code>len</code> равен 0, <code>append</code> и <code>range</code> работают. Различие важно только на границах: JSON и сравнение с <code>nil</code>.</p>']],
 ['h','5. Типовые операции'],
 ['code',`package main

import (
	"fmt"
	"slices"
)

func main() {
	xs := []int{5, 2, 8, 1}
	slices.Sort(xs)
	fmt.Println(xs, slices.Contains(xs, 8), slices.Index(xs, 5), slices.Max(xs))

	// удалить элемент с индексом 2
	xs = slices.Delete(xs, 2, 3)
	fmt.Println(xs)

	// вставить 10 на позицию 1
	xs = slices.Insert(xs, 1, 10)
	fmt.Println(xs)

	// отфильтровать на месте: оставить чётные
	nums := []int{1, 2, 3, 4, 5, 6}
	kept := nums[:0]
	for _, n := range nums {
		if n%2 == 0 {
			kept = append(kept, n)
		}
	}
	fmt.Println(kept)

	// вырезать страницу: offset и limit
	page := func(xs []int, offset, limit int) []int {
		if offset >= len(xs) {
			return nil
		}
		return xs[offset:min(offset+limit, len(xs))]
	}
	all := []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}
	fmt.Println(page(all, 10, 5), page(all, 20, 5) == nil)
}`],
 ['out',`[1 2 5 8] true 2 8
[1 2 8]
[1 10 2 8]
[2 4 6]
[10 11] true`],
 ['tbl',['Задача','Как'],[
  ['Добавить в конец','<code>s = append(s, x)</code>'],
  ['Добавить срез в конец','<code>s = append(s, other...)</code>'],
  ['Удалить по индексу','<code>s = slices.Delete(s, i, i+1)</code>'],
  ['Вставить','<code>s = slices.Insert(s, i, x)</code>'],
  ['Есть ли элемент','<code>slices.Contains(s, x)</code>, индекс: <code>slices.Index(s, x)</code>'],
  ['Отсортировать','<code>slices.Sort(s)</code> или <code>sort.Slice(s, less)</code>'],
  ['Скопировать','<code>slices.Clone(s)</code> или <code>copy</code>'],
  ['Развернуть','<code>slices.Reverse(s)</code>'],
  ['Минимум и максимум','<code>slices.Min(s)</code>, <code>slices.Max(s)</code>']]],
 ['h','6. Срез срезов и срез структур'],
 ['code',`package main

import "fmt"

type Item struct {
	ID    int
	Title string
}

func main() {
	grid := make([][]int, 3)
	for i := range grid {
		grid[i] = make([]int, 3)
		grid[i][i] = 1
	}
	fmt.Println(grid)

	items := []Item{{1, "первый"}, {2, "второй"}}
	for _, it := range items {
		it.Title = "изменено" // it копия, оригинал не изменился
	}
	for i := range items {
		items[i].Title += "!"
	}
	fmt.Println(items)
}`],
 ['out',`[[1 0 0] [0 1 0] [0 0 1]]
[{1 первый!} {2 второй!}]`],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>index out of range [5] with length 3</code>','Индекс за пределами. Проверяй <code>len</code> перед обращением'],
  ['Добавили в срез, а изменений нет','Забыли присвоить результат: <code>s = append(s, x)</code>'],
  ['Подсрез «испортил» исходный срез','Общая память. Скопируй данные или ограничь ёмкость'],
  ['API отдаёт <code>null</code> вместо <code>[]</code>','Срез остался nil. Создай его через <code>[]T{}</code> или <code>make</code>'],
  ['Структуры в <code>range</code> не меняются','Переменная цикла копия. Меняй через индекс'],
  ['Утечка памяти от маленького среза большого массива','Подсрез держит весь исходный массив. Для долго живущих данных сделай <code>slices.Clone</code>']]],
 ['h','8. Практика'],
 ['ol',[
  'Напиши <code>reverse(xs []int) []int</code> без пакета slices, потом проверь против <code>slices.Reverse</code>.',
  'Реализуй <code>unique(xs []int) []int</code>, сохраняющую порядок. Используй map для проверки (след. тема).',
  'Воспроизведи баг с общей памятью и исправь тремя способами: <code>copy</code>, <code>slices.Clone</code>, тройной срез.',
  'Сделай функцию <code>paginate(items []string, page, size int) []string</code> с проверкой границ, чтобы она не падала на пустом списке и страницах за концом.',
  'Проверь, что <code>[]string{}</code> и <code>nil</code> превращаются в JSON по-разному.']],
 ['src',[
  ['Go Slices: usage and internals (блог Go)','https://go.dev/blog/slices-intro','Главная статья про срезы, написана авторами языка','en'],
  ['Arrays, slices (and strings): The mechanics of append','https://go.dev/blog/slices','Как работает append и зачем нужен заголовок среза','en'],
  ['Спецификация: Slice types','https://go.dev/ref/spec#Slice_types','Формальное описание срезов','en'],
  ['Пакет slices','https://pkg.go.dev/slices','Все функции: Sort, Contains, Index, Insert, Delete и другие','en'],
  ['A Tour of Go: Slices','https://go.dev/tour/moretypes/7','Серия интерактивных уроков про срезы','en'],
  ['Go by Example: Slices','https://gobyexample.com/slices','Короткие примеры','en']]]],
 q:[["Чем срез отличается от массива?","Массив значение фиксированного размера и копируется целиком, срез это окно (указатель, длина, ёмкость) на общий массив."],["Почему результат append нужно присваивать?","append может вернуть новый срез на другой массив, а старая переменная его не увидит."],["Как подсрез может испортить исходный срез?","Если ёмкости хватает, append пишет в общий массив и затирает соседние элементы."],["Чем nil-срез отличается от пустого в JSON?","nil даёт null, пустой даёт []."],["Что делает make([]T, 0, n)?","Создаёт пустой срез с запасом n и избавляет от лишних перевыделений."]],
 l:[["art","Arrays, slices: The mechanics of append","https://go.dev/blog/slices","en"],["doc","Пакет slices","https://pkg.go.dev/slices","en"],["trainer","A Tour of Go: Slices","https://go.dev/tour/moretypes/7","en"],["trainer","Go by Example: Slices","https://gobyexample.com/slices","en"]]},

"s2-2":{b:[
 ['p',`<b>Map</b> (словарь, хэш-таблица) хранит пары «ключ → значение» и находит значение по ключу практически мгновенно. Если в задаче есть слова «найти по ID», «посчитать сколько раз», «сгруппировать», «убрать дубликаты» или «закэшировать», ответ почти всегда map.`],
 ['real',5,'каждый день',[
  '<b>Поиск по ключу</b>: пользователи по ID, настройки по имени, товары по артикулу.',
  '<b>Подсчёты</b>: сколько раз встретилось слово, сколько заказов у каждого клиента.',
  '<b>Группировка</b>: разложить заказы по статусам, события по дням.',
  '<b>Множества</b> (убрать дубликаты, проверить «уже видели»): <code>map[T]struct{}</code>.',
  '<b>Кэши</b> и мемоизация: «посчитал один раз, запомнил».',
  '<b>Динамический JSON</b>: <code>map[string]any</code>, когда структура заранее неизвестна.']],
 ['h','1. Создание, чтение, удаление'],
 ['code',`package main

import "fmt"

func main() {
	ages := map[string]int{"Аня": 25, "Боря": 31}
	ages["Вика"] = 19 // добавить или перезаписать

	v, ok := ages["Гена"] // чтение с проверкой: ok показывает, есть ли ключ
	fmt.Println(v, ok)

	if age, ok := ages["Аня"]; ok {
		fmt.Println("Аня:", age)
	}

	delete(ages, "Боря")
	fmt.Println(len(ages))
}`],
 ['out',`0 false
Аня: 25
2`],
 ['ul',[
  '<b>Создание</b>: литерал <code>map[string]int{...}</code> или <code>make(map[string]int)</code>.',
  '<b>Чтение несуществующего ключа не ошибка</b>: вернётся zero value. Поэтому «не нашли» и «нашли ноль» различают вторым значением <code>ok</code> (идиома «comma ok»).',
  '<code>delete(m, key)</code> безопасна, даже если ключа нет. <code>len(m)</code> число пар.',
  'Ключом может быть любой <b>сравнимый</b> тип: числа, строки, bool, структуры из таких полей, массивы. Срез и map ключом быть не могут.']],
 ['h','2. nil-map: чтение можно, запись нельзя'],
 ['code',`package main

import "fmt"

func main() {
	var m map[string]int // nil
	fmt.Println(m["x"], len(m))
	m["x"] = 1
}`],
 ['out',`0 0
panic: assignment to entry in nil map
…`],
 ['p','Читать из nil-map безопасно, а вот писать нельзя: паника. Всегда создавай map через <code>make</code> или литерал перед записью. Эта паника часто возникает, когда map лежит в структуре, а конструктор про неё забыл.'],
 ['h','3. Порядок обхода случаен'],
 ['code',`package main

import (
	"fmt"
	"sort"
)

func main() {
	stock := map[string]int{"яблоки": 5, "груши": 2, "киви": 9}

	keys := make([]string, 0, len(stock))
	for k := range stock {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, k := range keys {
		fmt.Println(k, stock[k])
	}
}`],
 ['out',`груши 2
киви 9
яблоки 5`],
 ['p','Если вывести map через <code>range</code> напрямую, порядок будет разным при каждом запуске: это сделано намеренно, чтобы никто не рассчитывал на порядок. Нужен стабильный порядок? Собери ключи в срез, отсортируй и иди по нему. Те же ключи в <code>fmt.Println(stock)</code> печатаются уже отсортированными: <code>fmt</code> делает это для читаемости.'],
 ['h','4. Типовые приёмы'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

type Order struct {
	ID     int
	Status string
}

type Point struct{ X, Y int }

func main() {
	// счётчик слов
	counts := map[string]int{}
	for _, w := range strings.Fields("go это go и ещё раз go") {
		counts[w]++ // отсутствующий ключ даёт 0, прибавляем 1
	}
	fmt.Println(counts["go"], counts["раз"], len(counts))

	// группировка: статус → список ID
	orders := []Order{{1, "paid"}, {2, "new"}, {3, "paid"}}
	byStatus := map[string][]int{}
	for _, o := range orders {
		byStatus[o.Status] = append(byStatus[o.Status], o.ID)
	}
	fmt.Println(byStatus["paid"], byStatus["new"])

	// множество: map со значениями struct{} (они не занимают места)
	seen := map[string]struct{}{}
	for _, tag := range []string{"go", "web", "go", "api", "web"} {
		seen[tag] = struct{}{}
	}
	_, has := seen["api"]
	fmt.Println(len(seen), has)

	// структура как ключ
	visited := map[Point]bool{{1, 2}: true}
	fmt.Println(visited[Point{1, 2}], visited[Point{3, 4}])
}`],
 ['out',`3 1 5
[1 3] [2]
3 true
true false`],
 ['tbl',['Задача','Шаблон'],[
  ['Посчитать','<code>counts[key]++</code>'],
  ['Сгруппировать','<code>m[key] = append(m[key], item)</code>'],
  ['Убрать дубликаты, множество','<code>set[x] = struct{}{}</code>, проверка: <code>_, ok := set[x]</code>'],
  ['Индекс по ID','<code>byID[u.ID] = u</code> и дальше <code>u, ok := byID[id]</code>'],
  ['Кэш','<code>if v, ok := cache[k]; ok { return v }</code>']]],
 ['h','5. Кэш: мемоизация'],
 ['code',`package main

import "fmt"

var cache = map[int]int{}

func fib(n int) int {
	if n < 2 {
		return n
	}
	if v, ok := cache[n]; ok {
		return v
	}
	r := fib(n-1) + fib(n-2)
	cache[n] = r
	return r
}

func main() {
	fmt.Println(fib(50))
}`],
 ['out','12586269025'],
 ['p','Без кэша <code>fib(50)</code> считается миллиарды операций (каждое значение пересчитывается много раз), с кэшем 50. Тот же шаблон работает для «дорогих» вызовов: результат запроса к внешнему сервису, разобранный шаблон, права пользователя.'],
 ['case','Индекс по ID вместо поиска в цикле',[
  '<p>Есть список заказов и список клиентов. Для каждого заказа нужен клиент. Один раз собери <code>customers := map[int]Customer{}</code>, и в цикле по заказам делай <code>c := customers[o.CustomerID]</code>. Вместо миллиона сравнений (тысяча на тысячу) получишь тысячу чтений. Так объединяют данные из разных источников в каждом втором сервисе.</p>']],
 ['warn','<b>Map не потокобезопасна.</b> Одновременная запись из нескольких горутин приводит к <code>fatal error: concurrent map writes</code> и падению программы, которое нельзя перехватить. Защищай map мьютексом (<code>sync.Mutex</code> или <code>sync.RWMutex</code>) или используй <code>sync.Map</code>. Подробно разберём в теме про конкурентность.'],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>panic: assignment to entry in nil map</code>','Map не создана. Используй <code>make</code> или литерал'],
  ['Порядок вывода меняется от запуска к запуску','Обход map случаен. Отсортируй ключи'],
  ['<code>invalid map key type []int</code>','Ключ должен быть сравнимым. Для срезов используй строку или структуру'],
  ['<code>fatal error: concurrent map writes</code>','Нужна синхронизация. Мьютекс или sync.Map'],
  ['Значение «не найдено» путается с нулём','Проверяй <code>v, ok := m[k]</code>, а не только <code>v</code>'],
  ['Нельзя поменять поле структуры в map: <code>m[k].Name = ...</code>','Это не адресуемое значение. Достань, измени, положи обратно или храни указатели']]],
 ['h','7. Практика'],
 ['ol',[
  'Посчитай частоту слов в тексте и выведи топ-3 (понадобится сортировка ключей по значению).',
  'Реализуй <code>unique(xs []string) []string</code> с сохранением порядка через множество.',
  'Сгруппируй слова по первой букве: <code>map[rune][]string</code>.',
  'Сделай кэш для «дорогой» функции с искусственной задержкой и убедись, что второй вызов мгновенный.',
  'Объясни, как отличить в map «нет ключа» и «ключ со значением 0».']],
 ['src',[
  ['Go maps in action (блог Go)','https://go.dev/blog/maps','Классическая статья авторов языка про map','en'],
  ['Спецификация: Map types','https://go.dev/ref/spec#Map_types','Что допустимо ключом и как работает','en'],
  ['Пакет maps','https://pkg.go.dev/maps','Клонирование, копирование, удаление по условию','en'],
  ['Пакет sync: Mutex, RWMutex, Map','https://pkg.go.dev/sync','Что использовать для защиты map в горутинах','en'],
  ['A Tour of Go: Maps','https://go.dev/tour/moretypes/19','Интерактивные уроки','en'],
  ['Go by Example: Maps','https://gobyexample.com/maps','Короткие примеры','en']]]],
 q:[["Как отличить отсутствие ключа от значения ноль?","Прочитать с проверкой: v, ok := m[key]; ok равно false, если ключа нет."],["Что будет при записи в nil-map?","Паника: assignment to entry in nil map."],["Почему порядок обхода map нельзя использовать?","Он намеренно случайный."],["Как сделать множество в Go?","map[T]struct{}: значения не занимают места, проверка наличия через comma ok."],["Почему нельзя писать в map из нескольких горутин?","Map не потокобезопасна: будет fatal error: concurrent map writes. Нужен мьютекс."]],
 l:[["art","Go maps in action (блог Go)","https://go.dev/blog/maps","en"],["doc","Пакет maps","https://pkg.go.dev/maps","en"],["doc","Пакет sync","https://pkg.go.dev/sync","en"],["trainer","A Tour of Go: Maps","https://go.dev/tour/moretypes/19","en"]]},

"s2-3":{b:[
 ['p',`Строка в Go это <b>неизменяемая последовательность байтов</b>, которая по умолчанию содержит UTF-8. Для латиницы байт и символ совпадают, а вот для кириллицы нет: в русской букве два байта. Пока работаешь с английским текстом, разницы не видно, потому и появляются баги с русскими именами.`],
 ['real',5,'каждый день',[
  '<b>Валидация</b> ввода: длина имени, формат email, запрещённые символы. Считать длину нужно в символах, а не в байтах.',
  '<b>Разбор текста</b>: строки логов, CSV, команды, заголовки (<code>strings.Split</code>, <code>strings.Fields</code>, <code>strings.Cut</code>).',
  '<b>Нормализация</b>: <code>TrimSpace</code>, <code>ToLower</code> для email и логинов перед сравнением.',
  '<b>Slug и URL</b>: превратить «Привет, мир!» в <code>privet-mir</code>.',
  '<b>Сборка текста</b>: отчёты, письма, SQL-запросы через <code>strings.Builder</code> и <code>fmt.Sprintf</code>.',
  '<b>Обрезка для превью</b> («первые 100 символов статьи»), где резать надо по символам.']],
 ['h','1. Байты, руны и символы'],
 ['code',`package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	s := "Привет"
	fmt.Println(len(s), utf8.RuneCountInString(s), len([]rune(s)))
	fmt.Println(s[0], s[0:2], string([]rune(s)[0]))

	for i, r := range "Гоу" {
		fmt.Print(i, ":", string(r), " ")
	}
	fmt.Println()
}`],
 ['out',`12 6 6
208 П П
0:Г 2:о 4:у`],
 ['tbl',['Что','Что это'],[
  ['<code>len(s)</code>','Число <b>байтов</b>: у «Привет» это 12, а не 6'],
  ['<code>utf8.RuneCountInString(s)</code>, <code>len([]rune(s))</code>','Число <b>символов</b> (рун): 6'],
  ['<code>s[i]</code>','Один <b>байт</b> (число типа <code>byte</code>), не символ'],
  ['<code>s[a:b]</code>','Срез по байтам: можно «разрезать» букву пополам'],
  ['<code>for i, r := range s</code>','Идёт по <b>рунам</b>, <code>i</code> позиция в байтах'],
  ['<code>[]rune(s)</code>','Превращает строку в срез символов: с ним можно безопасно индексировать и резать']]],
 ['warn','<code>s[0:1]</code> от строки «Привет» даёт половину буквы и «кракозябру» на выводе. Если резать надо по символам (превью, ограничение длины), сначала переведи в <code>[]rune</code>.'],
 ['h','2. Неизменяемость и разворот строки'],
 ['code',`package main

import "fmt"

func reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func main() {
	fmt.Println(reverse("Привет"))
	s := "go"
	s[0] = 'G'
}`],
 ['out','./main.go:16:2: cannot assign to s[0] (neither addressable nor a map index expression)'],
 ['p','Строки менять на месте нельзя: любое «изменение» создаёт новую строку. Если надо править, переведи в <code>[]rune</code> (для текста) или <code>[]byte</code> (для данных), измени и собери обратно. Этот же приём используется для разворота: <code>[]rune</code> позволяет не порвать кириллицу.'],
 ['h','3. Пакет strings: рабочий набор'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Go: быстрый, простой, надёжный  "
	t := strings.TrimSpace(s)
	fmt.Println(strings.HasPrefix(t, "Go"), strings.Contains(t, "простой"), strings.ToUpper(t))

	parts := strings.Split(t, ", ")
	fmt.Println(len(parts), parts)
	fmt.Println(strings.Join(parts, " | "))

	fmt.Println(strings.ReplaceAll("a-b-c", "-", "+"), strings.Fields(" a  b c "))

	key, val, found := strings.Cut("name=Аня", "=")
	fmt.Println(key, val, found)
	fmt.Println(strings.EqualFold("Go", "GO"), strings.Repeat("=", 5))
}`],
 ['out',`true true GO: БЫСТРЫЙ, ПРОСТОЙ, НАДЁЖНЫЙ
3 [Go: быстрый простой надёжный]
Go: быстрый | простой | надёжный
a+b+c [a b c]
name Аня true
true =====`],
 ['tbl',['Функция','Что делает'],[
  ['<code>TrimSpace(s)</code>','Убирает пробелы и переводы строк по краям'],
  ['<code>Split(s, sep)</code> / <code>Fields(s)</code>','Разбить по разделителю / по любым пробелам'],
  ['<code>Join(parts, sep)</code>','Склеить срез строк'],
  ['<code>Contains</code>, <code>HasPrefix</code>, <code>HasSuffix</code>, <code>Index</code>','Поиск подстроки'],
  ['<code>ReplaceAll(s, old, new)</code>','Заменить все вхождения'],
  ['<code>ToLower</code>, <code>ToUpper</code>, <code>EqualFold</code>','Регистр и сравнение без учёта регистра'],
  ['<code>Cut(s, sep)</code>','Разрезать по первому разделителю: ключ=значение, заголовок: значение'],
  ['<code>Repeat</code>, <code>Count</code>, <code>TrimPrefix</code>, <code>TrimSuffix</code>','Повтор, подсчёт, обрезка префикса и суффикса']]],
 ['h','4. strings.Builder: сборка длинного текста'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

func main() {
	var sb strings.Builder
	for i := 1; i <= 3; i++ {
		fmt.Fprintf(&sb, "строка %d\\n", i)
	}
	sb.WriteString("конец")
	fmt.Println(sb.String())
}`],
 ['out',`строка 1
строка 2
строка 3
конец`],
 ['p','Склеивать строки в цикле через <code>s += x</code> дорого: каждый раз создаётся новая строка и копируется всё накопленное, получается <code>O(n²)</code>. <code>strings.Builder</code> копит данные в буфере и отдаёт готовую строку один раз: <code>O(n)</code>. Для коротких склеек (два-три слагаемых) <code>+</code> и <code>fmt.Sprintf</code> вполне подходят.'],
 ['case','Slug для адреса статьи',[
  '<p>Блог или магазин строит красивые URL из названий: «Привет, Мир! Go 1.24» превращается в <code>привет-мир-go-1-24</code>. Это типовая задача на руны, <code>unicode</code> и <code>Builder</code>:</p>']],
 ['code',`package main

import (
	"fmt"
	"strings"
	"unicode"
)

func slug(title string) string {
	var sb strings.Builder
	prevDash := false
	for _, r := range strings.ToLower(title) {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			sb.WriteRune(r)
			prevDash = false
		case !prevDash && sb.Len() > 0:
			sb.WriteByte('-')
			prevDash = true
		}
	}
	return strings.TrimRight(sb.String(), "-")
}

func main() {
	fmt.Println(slug("Привет, Мир! Go 1.24"))
	fmt.Println(slug("  Много   пробелов...  "))
}`],
 ['out',`привет-мир-go-1-24
много-пробелов`],
 ['h','5. Длина по символам: валидация и превью'],
 ['code',`package main

import (
	"fmt"
	"unicode/utf8"
)

func validName(name string) bool {
	n := utf8.RuneCountInString(name)
	return n >= 3 && n <= 20
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}

func main() {
	fmt.Println(validName("Ян"), validName("Анна"), validName("Александра"))
	fmt.Println(truncate("Длинное название статьи", 7))
	fmt.Println(truncate("Коротко", 20))
}`],
 ['out',`false true true
Длинное…
Коротко`],
 ['p','Если проверять <code>len(name) &lt;= 20</code>, десять русских букв превратятся в 20 байтов и пройдут, а одиннадцатая нет: пользователь будет в недоумении. Поэтому длину текста для людей всегда считают в рунах.'],
 ['h','6. Преобразования и форматирование'],
 ['ul',[
  '<code>string(65)</code> даёт «A» (символ с кодом 65), а не «65». Число в текст: <code>strconv.Itoa</code> или <code>fmt.Sprintf("%d", n)</code>.',
  '<code>[]byte(s)</code> и <code>string(b)</code> копируют данные в обе стороны. Это важно для больших объёмов.',
  '<code>fmt.Sprintf</code> собирает строку по шаблону, <code>%q</code> показывает строку в кавычках со скрытыми символами: удобно для отладки.',
  '<b>Сырые строки</b> в обратных кавычках не обрабатывают <code>\\n</code> и кавычки: удобны для регулярных выражений, SQL, JSON.']],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Длина русской строки в два раза больше ожидаемой','<code>len</code> считает байты. Для символов <code>utf8.RuneCountInString</code>'],
  ['Кракозябры после обрезки <code>s[:10]</code>','Разрезали руну пополам. Резать через <code>[]rune</code>'],
  ['<code>cannot assign to s[0]</code>','Строки неизменяемы. Работай через <code>[]rune</code> или <code>[]byte</code>'],
  ['Сравнение email «A@x.ru» и «a@x.ru» не сходится','Нормализуй: <code>strings.ToLower(strings.TrimSpace(email))</code>'],
  ['Склейка в цикле тормозит','Используй <code>strings.Builder</code>']]],
 ['h','8. Практика'],
 ['ol',[
  'Напиши функцию <code>isPalindrome(s string) bool</code>, которая игнорирует регистр и пробелы и работает с кириллицей.',
  'Посчитай количество слов, гласных и заглавных букв в строке на русском.',
  'Реализуй <code>parseHeader(line string) (key, value string, ok bool)</code> для строк вида «Content-Type: text/html» через <code>strings.Cut</code> и <code>TrimSpace</code>.',
  'Сделай <code>maskEmail("anna@example.com")</code> так, чтобы получилось «a***@example.com».',
  'Сравни скорость склейки 100 000 строк через <code>+=</code> и через <code>Builder</code>.']],
 ['src',[
  ['Strings, bytes, runes and characters in Go (блог Go)','https://go.dev/blog/strings','Главная статья про устройство строк, написана авторами языка','en'],
  ['Пакет strings','https://pkg.go.dev/strings','Все функции работы со строками','en'],
  ['Пакет unicode/utf8','https://pkg.go.dev/unicode/utf8','Работа с рунами и кодировкой','en'],
  ['Пакет unicode','https://pkg.go.dev/unicode','IsLetter, IsDigit, IsUpper и другие проверки','en'],
  ['Спецификация: String types','https://go.dev/ref/spec#String_types','Формальные правила','en'],
  ['Go by Example: Strings and Runes','https://gobyexample.com/strings-and-runes','Короткий пример про руны','en'],
  ['Go by Example: String Functions','https://gobyexample.com/string-functions','Основные функции пакета strings','en']]]],
 q:[["Почему len(\"Привет\") равно 12?","len считает байты, а русская буква в UTF-8 занимает два байта."],["Как правильно посчитать символы?","utf8.RuneCountInString(s) или len([]rune(s))."],["Что отдаёт s[0] и что отдаёт range по строке?","s[0] байт, range руны (символы) с позицией в байтах."],["Почему s += x в цикле плохо?","Каждый раз создаётся новая строка и копируется всё накопленное: O(n²). Нужен strings.Builder."],["Как нормализовать email для сравнения?","strings.ToLower(strings.TrimSpace(email))."]],
 l:[["art","Strings, bytes, runes and characters in Go","https://go.dev/blog/strings","en"],["doc","Пакет strings","https://pkg.go.dev/strings","en"],["doc","Пакет unicode/utf8","https://pkg.go.dev/unicode/utf8","en"],["trainer","Go by Example: String Functions","https://gobyexample.com/string-functions","en"]]}
});
