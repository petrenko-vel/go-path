// Конспекты: глава «Базовые типы», темы s1-16 … s1-26. «§» = обратная кавычка.
mergeNotes({
"s1-16":{b:[
 ['def',`<b>Пакет <code>strings</code></b> это пакет стандартной библиотеки Go (путь импорта <code>"strings"</code>), в котором собраны функции для работы со значениями типа <code>string</code>: поиск подстроки, замена, разрезание на части, склейка, обрезка пробелов, смена регистра, сравнение. Строка в Go по спецификации это <b>неизменяемая</b> последовательность байт (обычно в кодировке UTF-8), поэтому ни одна функция пакета не меняет исходную строку: каждая возвращает <b>новую</b> строку или число/булево значение. Пакет не нужно устанавливать, он есть в Go «из коробки». Его не стоит путать с пакетом <code>strconv</code> (превращает строки в числа и обратно), с пакетом <code>bytes</code> (те же функции, но для <code>[]byte</code>) и с типом <code>strings.Builder</code> (эффективная сборка длинной строки по кусочкам). Сам тип <code>string</code> встроен в язык, а вот функции для него живут именно в <code>strings</code>.`],
 ['h','Пример'],
 ['lines',`package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "  Go Backend, Go Path  "
	fmt.Println(strings.TrimSpace(s))
	fmt.Println(strings.ToUpper(s))
	fmt.Println(strings.Contains(s, "Path"))
	fmt.Println(strings.Count(s, "Go"))
	fmt.Println(strings.Replace(s, "Go", "Rust", 1))
}`,[
  ['1','Каждая программа на Go начинается с имени пакета; <code>main</code> значит «это запускаемая программа».'],
  ['3–6','Подключаем два пакета: <code>fmt</code> для печати и <code>strings</code> для работы со строками. Без импорта <code>strings.</code> не скомпилируется.'],
  ['8','Точка входа: с функции <code>main</code> начинается выполнение.'],
  ['9','Исходная строка с пробелами по краям, как будто её ввёл пользователь.'],
  ['10','<code>TrimSpace</code> убирает пробелы, табы и переводы строк с обоих концов. Внутренние пробелы остаются.'],
  ['11','<code>ToUpper</code> возвращает копию в верхнем регистре; сама <code>s</code> не меняется.'],
  ['12','<code>Contains</code> отвечает <code>true</code>/<code>false</code>: есть ли подстрока.'],
  ['13','<code>Count</code> считает, сколько раз подстрока встречается (без пересечений).'],
  ['14','<code>Replace</code> заменяет; последний аргумент 1 это «не больше одной замены». Значение <code>-1</code> заменит все.']]],
 ['out',`Go Backend, Go Path
  GO BACKEND, GO PATH
true
2
  Rust Backend, Go Path`],
 ['h','Зачем это нужно'],
 ['p','Почти любые данные, которые приходят в бэкенд снаружи (поля формы, заголовки, параметры запроса, строки из файла), это строки. Прежде чем их использовать, их надо почистить, разрезать, проверить. Всё это делает <code>strings</code>. Это один из самых часто используемых пакетов вместе с <code>fmt</code> и <code>errors</code>: в обычном Go-проекте он подключён почти в каждом втором файле.'],
 ['real',5,'каждый день',[
  '<b>Очистка ввода:</b> <code>TrimSpace</code> и <code>ToLower</code> для email и логина перед сохранением и сравнением.',
  '<b>Разбор HTTP:</b> заголовок <code>Authorization: Bearer ...</code> разрезается через <code>Cut</code> или <code>HasPrefix</code>, пути вида <code>/api/v1/users</code> проверяются по префиксу.',
  '<b>CSV-подобные строки:</b> <code>Split</code> режет «a,b,c» на части, <code>Join</code> собирает обратно (например, список id для SQL <code>IN</code>).',
  '<b>Конфигурация:</b> строки вида <code>KEY=value</code> из .env и переменных окружения.',
  '<b>Логи и сообщения:</b> <code>Repeat</code>, <code>Title</code>-подобное форматирование, замены в шаблонах.']],
 ['h','1. Поиск и проверка'],
 ['p','Вопросы вида «есть ли?», «с чего начинается?», «где находится?». Все работают по <b>байтам</b>, и индекс, который вернул <code>Index</code>, тоже байтовый (для кириллицы один символ занимает 2 байта). Если подстроки нет, <code>Index</code> вернёт <code>-1</code>.'],
 ['lines',`package main

import (
	"fmt"
	"strings"
)

func main() {
	path := "/api/v1/users"
	fmt.Println(strings.HasPrefix(path, "/api"))
	fmt.Println(strings.HasSuffix(path, ".json"))
	fmt.Println(strings.Index(path, "v1"), strings.Index(path, "zzz"))
	fmt.Println(strings.TrimPrefix(path, "/api"))

	header := "Authorization: Bearer abc123"
	name, value, found := strings.Cut(header, ": ")
	fmt.Println(name, "|", value, "|", found)
}`,[
  ['9','Путь запроса, какой приходит в обработчик HTTP.'],
  ['10','<code>HasPrefix</code>: начинается ли строка с «/api». Так роутеры решают, какой блок кода вызвать.'],
  ['11','<code>HasSuffix</code>: заканчивается ли на «.json». Здесь <code>false</code>.'],
  ['12','<code>Index</code> возвращает позицию первого вхождения или <code>-1</code>, если подстроки нет. Всегда сравнивай результат с <code>-1</code>, а не с нулём: ноль это законная позиция.'],
  ['13','<code>TrimPrefix</code> убирает префикс <b>один раз</b>, если он есть, иначе возвращает строку как есть.'],
  ['15','Строка заголовка, в которой имя и значение разделены двоеточием с пробелом.'],
  ['16','<code>Cut</code> (с Go 1.18) режет строку по <b>первому</b> разделителю и возвращает три значения: часть до, часть после и флаг «разделитель найден». Удобнее, чем <code>Index</code> с ручной нарезкой.'],
  ['17','Печатаем три результата через разделитель, чтобы увидеть границы.']]],
 ['out',`true
false
5 -1
/v1/users
Authorization | Bearer abc123 | true`],
 ['h','2. Разрезание и склейка'],
 ['p','<code>Split</code> режет строку по разделителю, <code>Fields</code> режет по любым пробельным символам и <b>выбрасывает пустые куски</b>, <code>Join</code> делает обратное. Разница между <code>Split</code> и <code>Fields</code> важна: <code>Split("a,,b", ",")</code> даст три элемента, средний пустой.'],
 ['lines',`package main

import (
	"fmt"
	"strings"
)

func main() {
	csv := "anna,bob,,carl"
	parts := strings.Split(csv, ",")
	fmt.Println(len(parts), parts)
	fmt.Printf("%q\\n", parts)

	words := strings.Fields("  много   пробелов \\n и табов ")
	fmt.Println(len(words), words)

	fmt.Println(strings.Join(parts, " | "))
}`,[
  ['9','Строка с пропуском: между двумя запятыми нет имени.'],
  ['10','<code>Split</code> возвращает срез строк <code>[]string</code>. Пустое место между запятыми превратилось в пустую строку.'],
  ['11','Длина среза 4, а не 3: пустой элемент считается.'],
  ['12','Спецификатор <code>%q</code> печатает каждую строку в кавычках, поэтому пустой элемент виден как <code>""</code>.'],
  ['14','<code>Fields</code> делит по любому количеству пробелов, табов и переводов строк и не оставляет пустых частей.'],
  ['15','Получилось 4 слова, несмотря на кучу пробелов.'],
  ['17','<code>Join</code> склеивает срез в одну строку через разделитель; обратная операция к <code>Split</code>.']]],
 ['out',`4 [anna bob  carl]
["anna" "bob" "" "carl"]
4 [много пробелов и табов]
anna | bob |  | carl`],
 ['h','3. Обрезка: Trim, TrimLeft, TrimPrefix'],
 ['p','Самая частая ловушка пакета: функции с суффиксом <code>Left</code>, <code>Right</code> и просто <code>Trim</code> принимают не подстроку, а <b>набор символов</b> (cutset), и срезают по одному любые символы из набора, пока они попадаются. А <code>TrimPrefix</code>/<code>TrimSuffix</code> работают с цельной подстрокой.'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

func main() {
	fmt.Println(strings.Trim("xxhixx", "x"))
	fmt.Println(strings.TrimLeft("abcabc-name", "abc"))
	fmt.Println(strings.TrimPrefix("abcabc-name", "abc"))
}`],
 ['out',`hi
-name
abc-name`],
 ['p','Видно, что <code>TrimLeft</code> с набором <code>"abc"</code> съел оба повтора и остановился на дефисе, а <code>TrimPrefix</code> убрал только один «abc» целиком.'],
 ['h','4. Строки неизменяемы'],
 ['p','Присвоить символ строки нельзя: компилятор не даст. Чтобы «изменить» строку, надо создать новую (через функции <code>strings</code>, конкатенацию или конвертацию в <code>[]byte</code>/<code>[]rune</code> и обратно).'],
 ['code',`package main

import "fmt"

func main() {
	s := "go"
	s[0] = 'G'
	fmt.Println(s)
}`],
 ['out',`./main.go:7:2: cannot assign to s[0] (neither addressable nor a map index expression)`],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>TrimLeft(s, "abc")</code> срезал больше, чем ожидалось','Второй аргумент это набор символов. Для удаления целой подстроки используй <code>TrimPrefix</code>.'],
  ['Забыли присвоить результат: <code>strings.ToUpper(s)</code> «ничего не делает»','Функции возвращают новую строку, исходная неизменна. Пиши <code>s = strings.ToUpper(s)</code>.'],
  ['<code>Split("", ",")</code> вернул срез из одной пустой строки, а не пустой срез','Это задокументированное поведение. Проверяй <code>s == ""</code> заранее, если пустой ввод возможен.'],
  ['<code>Index</code> вернул число, но срез по нему «ломает» русский текст','Индекс байтовый, а кириллица двухбайтовая. Для посимвольной работы используй <code>[]rune</code> или <code>range</code>.'],
  ['Сравнение без учёта регистра через <code>ToLower(a) == ToLower(b)</code>','Работает, но создаёт две копии. Лучше <code>strings.EqualFold(a, b)</code>.'],
  ['Конкатенация в цикле <code>s += x</code> тормозит на больших объёмах','Каждый раз создаётся новая строка. Используй <code>strings.Builder</code>.']]],
 ['warn','Пакет <code>strings</code> <b>ничего не знает про локали</b>: <code>ToUpper</code> корректно работает с Unicode, но не учитывает особенности языков (например, турецкую «i»). Для сложной локализации есть пакеты <code>golang.org/x/text</code>.'],
 ['case','Нормализация email при регистрации','<p>Пользователь вводит <code>  Valeria@Example.COM </code>. Если сохранить как есть, потом не найдётся при входе и можно завести дубли. Стандартная практика: обрезать пробелы, привести к нижнему регистру, проверить наличие <code>@</code> через <code>Cut</code>.</p>'],
 ['lines',`package main

import (
	"fmt"
	"strings"
)

func normalize(email string) (string, bool) {
	email = strings.ToLower(strings.TrimSpace(email))
	user, domain, ok := strings.Cut(email, "@")
	if !ok || user == "" || !strings.Contains(domain, ".") {
		return "", false
	}
	return user + "@" + domain, true
}

func main() {
	fmt.Println(normalize("  Valeria@Example.COM "))
	fmt.Println(normalize("no-at-sign"))
}`,[
   ['8','Функция получает сырой ввод и возвращает чистый email и признак «корректный».'],
   ['9','Сначала <code>TrimSpace</code>, потом <code>ToLower</code>: порядок не важен, результат одинаков.'],
   ['10','<code>Cut</code> по «@»: пользователь слева, домен справа, <code>ok</code> показывает, что «@» вообще был.'],
   ['11–13','Отбраковываем: нет «@», пустое имя или в домене нет точки.'],
   ['14','Склеиваем обратно уже из проверенных частей.'],
   ['18–19','Первый вызов вернёт чистый адрес и <code>true</code>, второй пустую строку и <code>false</code>.']]],
 ['out',`valeria@example.com true
 false`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Можно ли изменить символ строки в Go?</b> Нет, строка неизменяема. Нужно создать новую или перейти к <code>[]byte</code>/<code>[]rune</code>.',
  '<b>В чём разница между <code>strings.Split</code> и <code>strings.Fields</code>?</b> <code>Split</code> режет по явному разделителю и сохраняет пустые части; <code>Fields</code> режет по пробельным символам любой длины и пустых частей не даёт.',
  '<b>Чем <code>TrimLeft</code> отличается от <code>TrimPrefix</code>?</b> <code>TrimLeft</code> принимает набор символов и срезает их сколько попадётся; <code>TrimPrefix</code> убирает ровно одну целую подстроку.',
  '<b>Как эффективно собрать длинную строку?</b> <code>strings.Builder</code> (и <code>Grow</code>, если размер известен), а не <code>+=</code> в цикле.',
  '<b>Как сравнить строки без учёта регистра?</b> <code>strings.EqualFold</code>.']],
 ['src',[
  ['Пакет strings (документация)','https://pkg.go.dev/strings','Полный список функций с примерами','en'],
  ['Go by Example: String Functions','https://gobyexample.com/string-functions','Короткие примеры основных функций','en'],
  ['Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','Официальный блог: как устроены строки','en'],
  ['Спецификация: строковые типы','https://go.dev/ref/spec#String_types','Строка как неизменяемая последовательность байт','en'],
  ['100 Go Mistakes','https://100go.co','Разбор типичных ошибок, в том числе со строками','en']]]
 ],
 q:[
  ['Почему <code>strings.ToUpper(s)</code> без присваивания ничего не меняет?','Строки неизменяемы, функция возвращает новую строку. Результат надо присвоить или использовать.'],
  ['Чем <code>Split</code> отличается от <code>Fields</code>?','<code>Split</code> режет по указанному разделителю и оставляет пустые части, <code>Fields</code> режет по любым пробельным символам и пустых частей не оставляет.'],
  ['Что делает <code>strings.Cut</code> и что возвращает?','Режет по первому вхождению разделителя, возвращает часть до, часть после и <code>bool</code> «разделитель найден».'],
  ['Что вернёт <code>Index</code>, если подстроки нет?','<code>-1</code>. Индекс считается в байтах.'],
  ['Какая ловушка у <code>TrimLeft</code>?','Второй аргумент это набор символов, а не префикс; срезаются все подряд идущие символы из набора.'],
  ['Как сравнить строки без учёта регистра?','<code>strings.EqualFold(a, b)</code>.']],
 quiz:[
  ['Что напечатает <code>s := "abc"; strings.ToUpper(s); fmt.Println(s)</code>?',['ABC','abc','ошибка компиляции','пустую строку'],1,'Функция вернула новую строку, но результат отброшен. Исходная <code>s</code> не изменилась.'],
  ['Сколько элементов вернёт <code>strings.Split("a,,b", ",")</code>?',['2','3','4','1'],1,'Пустое место между запятыми даёт пустую строку: «a», «», «b».'],
  ['Что вернёт <code>strings.Fields(" a  b ")</code>?',['["a" "b"]','["" "a" "" "b" ""]','["a" "" "b"]','ошибку'],0,'<code>Fields</code> делит по любым пробельным и пустых частей не оставляет.'],
  ['Что даст <code>strings.TrimLeft("aab-x", "ab")</code>?',['"b-x"','"-x"','"aab-x"','"x"'],1,'Второй аргумент это набор символов: «a» и «b» срезаются, пока попадаются, останавливается на дефисе.'],
  ['Какой вызов правильно разделит заголовок «Key: Value» на ключ и значение за один шаг?',['strings.Index','strings.Cut','strings.Count','strings.Trim'],1,'<code>Cut</code> возвращает обе части и флаг найденности.'],
  ['Что вернёт <code>strings.Index("hello", "z")</code>?',['0','-1','false','панику'],1,'Если подстроки нет, возвращается -1.']],
 task:{
  text:'<p>На вход подаётся одна строка с несколькими словами, разделёнными любым количеством пробелов (возможны пробелы по краям). Выведи три строки: 1) количество слов; 2) строку в верхнем регистре, в которой слова разделены одним пробелом; 3) слова, соединённые знаком «-» (регистр оригинальный).</p><p>Пример ввода: <code>  Hello   big world </code></p><p>Пример вывода:</p><pre>3\nHELLO BIG WORLD\nHello-big-world</pre><p>Читай строку целиком через <code>bufio.Scanner</code>. Если слов нет, выведи <code>0</code> и две пустые строки.</p>',
  starter:`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	line := scanner.Text()

	// TODO: разбей line на слова (strings.Fields)
	// TODO: выведи количество, слова в верхнем регистре через пробел, слова через "-"
	_ = strings.ToUpper
	fmt.Println(line)
}`,
  checks:[{in:'Hello big world\n',out:'3\nHELLO BIG WORLD\nHello-big-world'},{in:'  a   b  \n',out:'2\nA B\na-b'},{in:'Go\n',out:'1\nGO\nGo'},{in:'   \n',out:'0\n\n'}],
  solution:`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	words := strings.Fields(scanner.Text())
	fmt.Println(len(words))
	fmt.Println(strings.ToUpper(strings.Join(words, " ")))
	fmt.Println(strings.Join(words, "-"))
}`,
  hint:'<code>strings.Fields</code> сразу даёт срез слов без пустых частей, а <code>strings.Join</code> склеивает его с нужным разделителем.'},
 l:[
  ['doc','Пакет strings','https://pkg.go.dev/strings','en'],
  ['art','Go by Example: String Functions','https://gobyexample.com/string-functions','en'],
  ['art','Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','en'],
  ['trainer','A Tour of Go: строки и срезы','https://go.dev/tour/moretypes/1','en']]},

"s1-17":{b:[
 ['def',`<b>Приведение в строку</b> это получение значения типа <code>string</code> из значения другого типа: числа, булева значения, среза байт или рун, ошибки, структуры. В Go нет неявных преобразований, поэтому у этого действия есть несколько <b>разных</b> инструментов с разным смыслом. <b>Конвертация типа</b> <code>string(x)</code> (термин спецификации «conversion») меняет только представление: <code>string([]byte)</code> и <code>string([]rune)</code> собирают текст из байт и рун, а <code>string(65)</code> превращает <i>код символа</i> в символ «A», а не число в текст «65». Чтобы получить именно текстовую запись числа, используют функции пакета <code>strconv</code> (<code>Itoa</code>, <code>FormatInt</code>, <code>FormatFloat</code>, <code>FormatBool</code>) или форматирование из <code>fmt</code> (<code>Sprint</code>, <code>Sprintf</code>). Путать эти пути это одна из классических ошибок новичка в Go.`],
 ['h','Пример'],
 ['lines',`package main

import (
	"fmt"
	"strconv"
)

func main() {
	n := 42
	s := strconv.Itoa(n)
	fmt.Println(s + "!")
	fmt.Println(len(s))
	f := strconv.FormatFloat(3.14159, 'f', 2, 64)
	fmt.Println(f)
	fmt.Println(strconv.FormatBool(true))
}`,[
  ['3–6','Подключаем <code>fmt</code> и <code>strconv</code>. Название пакета означает «string conversion».'],
  ['9','Обычное целое число типа <code>int</code>.'],
  ['10','<code>Itoa</code> («integer to ASCII») превращает <code>int</code> в строку «42». Это самый частый способ.'],
  ['11','К строке можно добавить текст через <code>+</code>. Прибавить число напрямую к строке нельзя, поэтому сначала нужна <code>Itoa</code>.'],
  ['12','Длина строки «42» это 2 символа, а не число 42.'],
  ['13','<code>FormatFloat(x, формат, знаков, размер)</code>: формат <code>\'f\'</code> это обычная запись без степени, 2 знака после точки, 64 означает <code>float64</code>.'],
  ['14','Печатаем получившуюся строку «3.14» (округлено, не обрезано).'],
  ['15','<code>FormatBool</code> даёт строку «true» или «false».']]],
 ['out',`42!
2
3.14
true`],
 ['h','Зачем это нужно'],
 ['p','Всё, что уходит из программы «наружу» в текстовом виде (логи, ключи кэша, сообщения, SQL-запросы, имена файлов, JSON-поля), должно стать строкой. Числовой идентификатор пользователя в ключе Redis, номер страницы в URL, количество в сообщении об ошибке: везде нужна именно эта операция. Используется постоянно, но в виде <code>fmt.Sprintf</code> и <code>strconv.Itoa</code>, а вот <code>string(x)</code> от числа почти никогда не нужен.'],
 ['real',5,'каждый день',[
  '<b>Ключи кэша:</b> <code>"user:" + strconv.Itoa(id)</code>.',
  '<b>URL и запросы:</b> номер страницы и лимит превращаются в строки для query-параметров.',
  '<b>Логи и ошибки:</b> <code>fmt.Sprintf("пользователь %d не найден", id)</code>.',
  '<b>Работа с байтами:</b> тело HTTP-ответа приходит как <code>[]byte</code>, для показа или разбора его переводят в <code>string</code>.',
  '<b>Имена файлов и идентификаторы:</b> «report_2026_11.csv» собирается из чисел.']],
 ['h','1. Ловушка: string(число) даёт символ, а не цифры'],
 ['p','Конвертация <code>string(n)</code> для целого <code>n</code> трактует число как <b>код символа Юникода</b> (руну). Поэтому <code>string(65)</code> это «A». Компилятор это разрешает, но команда <code>go vet</code> предупреждает: «conversion from int to string yields a string of one rune». Для текстовой записи числа нужны <code>Itoa</code> или <code>Sprint</code>.'],
 ['lines',`package main

import "fmt"

func main() {
	n := 65
	fmt.Println(string(n))
	fmt.Println(string(rune(n)))
	fmt.Println(fmt.Sprint(n))
}`,[
  ['6','Число 65 это код буквы «A» в таблице Юникода.'],
  ['7','Лови ошибку: тут получается символ «A», а не текст «65». Компилируется, но почти всегда это не то, что хотели.'],
  ['8','Явное <code>rune(n)</code> показывает, что мы <b>намеренно</b> делаем символ из кода. Результат тот же, но читателю понятно, что это не опечатка.'],
  ['9','<code>fmt.Sprint(n)</code> возвращает текст «65», то есть то, что обычно и нужно.']]],
 ['out',`A
A
65`],
 ['h','2. fmt.Sprint, Sprintf и Sprintln'],
 ['p','Функции с приставкой <code>S</code> работают как <code>Print</code>, но <b>возвращают строку</b>, а не печатают. <code>Sprintf</code> с шаблоном самый гибкий и самый частый. У <code>Sprint</code> есть особенность: пробел между операндами ставится, только если <b>ни один из двух соседних не строка</b>.'],
 ['lines',`package main

import "fmt"

func main() {
	user, id, price := "anna", 7, 9.5
	msg := fmt.Sprintf("user=%s id=%d price=%.2f", user, id, price)
	fmt.Println(msg)
	fmt.Println(fmt.Sprint(id, price, user))
	fmt.Println(fmt.Sprintln("a", 1) == "a 1\\n")
}`,[
  ['6','Три переменные разных типов объявлены одной строкой.'],
  ['7','<code>Sprintf</code> собирает строку по шаблону: <code>%s</code> для строки, <code>%d</code> для целого, <code>%.2f</code> для числа с двумя знаками после запятой.'],
  ['8','Печатаем собранное сообщение.'],
  ['9','<code>Sprint</code> между <code>7</code> и <code>9.5</code> поставил пробел (оба не строки), а перед «anna» не поставил, потому что один из соседей строка. Из-за такого поведения <code>Sprint</code> используют редко.'],
  ['10','<code>Sprintln</code> разделяет всё пробелами и добавляет <code>\\n</code> в конце. Сравнение даёт <code>true</code>.']]],
 ['out',`user=anna id=7 price=9.50
7 9.5anna
true`],
 ['h','3. Из байт и рун в строку'],
 ['p','Для <code>[]byte</code> и <code>[]rune</code> конвертация <code>string(...)</code> именно то, что нужно. Она <b>копирует</b> данные (строка неизменяема, срез изменяем). Байтов в кириллице больше, чем символов: русская буква занимает 2 байта.'],
 ['lines',`package main

import "fmt"

func main() {
	b := []byte{72, 105, 33}
	r := []rune{1043, 1086}
	fmt.Println(string(b), string(r))
	text := "Привет"
	fmt.Println(len(text), len([]rune(text)))
	fmt.Println(string([]rune(text)[:3]))
}`,[
  ['6','Срез байт с кодами букв «H», «i» и знака «!».'],
  ['7','Срез рун с кодами «Г» и «о».'],
  ['8','Оба среза превращаются в строки через конвертацию <code>string(...)</code>.'],
  ['9','Русское слово из шести букв.'],
  ['10','<code>len</code> считает байты: 12. Количество символов даёт <code>len([]rune(text))</code>: 6.'],
  ['11','Берём первые три <b>символа</b> (не байта) и собираем обратно. Срез по байтам мог бы разрезать букву пополам.']]],
 ['out',`Hi! Го
12 6
При`],
 ['h','4. Склеивать число со строкой напрямую нельзя'],
 ['code',`package main

import "fmt"

func main() {
	id := 5
	fmt.Println("id: " + id)
}`],
 ['out',`./main.go:7:14: invalid operation: "id: " + id (mismatched types untyped string and int)`],
 ['p','Компилятор остановит: типы разные. Решения: <code>"id: " + strconv.Itoa(id)</code> или <code>fmt.Sprintf("id: %d", id)</code>. Для нескольких значений обычно удобнее <code>Sprintf</code>, для одного числа в ключе быстрее <code>Itoa</code>.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>string(65)</code> вернул «A», а нужен «65»','Конвертация числа в string даёт символ с этим кодом. Используй <code>strconv.Itoa(65)</code>.'],
  ['<code>"x" + 5</code> не компилируется','Нет неявного приведения. Преобразуй число явно.'],
  ['<code>strconv.Itoa(int64Value)</code> не компилируется','<code>Itoa</code> принимает только <code>int</code>. Для <code>int64</code> нужен <code>strconv.FormatInt(v, 10)</code>.'],
  ['<code>FormatFloat(x, \'f\', -1, 64)</code> даёт «лишние» знаки','Значение <code>-1</code> означает «минимум знаков для точного представления». Для денег лучше целые копейки.'],
  ['Вместо числа напечатался «&lt;nil&gt;» или «%!d(string=...)»','Несовпадение спецификатора и типа в <code>Sprintf</code>. Проверь <code>%d</code> для целых, <code>%s</code> для строк.']]],
 ['warn','Для денег не храни и не форматируй <code>float64</code>: ошибки округления накапливаются. Используй целые копейки и собирай строку «12.50» из двух целых.'],
 ['case','Ключ для кэша и поле для лога',[
  '<p>Сервис кэширует профиль пользователя в Redis. Ключ собирается из префикса и числового id: <code>"user:" + strconv.Itoa(id)</code>. Если по ошибке написать <code>"user:" + string(id)</code>, ключ станет «user:» плюс символ с кодом id (для id=65 это «user:A»), а промахи кэша будут необъяснимыми. В Go 1.15 для таких случаев появилось предупреждение <code>go vet</code>, поэтому линтер стоит включать в CI.</p>'].join('')],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Что вернёт <code>string(65)</code>?</b> «A»: число трактуется как код символа. Для «65» нужен <code>strconv.Itoa</code> или <code>fmt.Sprint</code>.',
  '<b>Чем <code>strconv.Itoa</code> отличается от <code>fmt.Sprint</code>?</b> <code>Itoa</code> только для <code>int</code>, быстрее и без аллокаций лишнего; <code>Sprint</code> универсален, но медленнее из-за интерфейсов и рефлексии.',
  '<b>Копируется ли память при <code>string([]byte)</code>?</b> Да: строка неизменяема, поэтому делается копия (компилятор иногда оптимизирует временные случаи).',
  '<b>Как получить строку из <code>int64</code>?</b> <code>strconv.FormatInt(v, 10)</code>.',
  '<b>Как посчитать символы, а не байты?</b> <code>utf8.RuneCountInString(s)</code> или <code>len([]rune(s))</code>.']],
 ['src',[
  ['Пакет strconv','https://pkg.go.dev/strconv','Itoa, FormatInt, FormatFloat, Quote','en'],
  ['Спецификация: конвертации в строку','https://go.dev/ref/spec#Conversions_to_and_from_a_string_type','Что именно делает string(x)','en'],
  ['Пакет fmt','https://pkg.go.dev/fmt','Sprint, Sprintf, Sprintln','en'],
  ['Go by Example: String Formatting','https://gobyexample.com/string-formatting','Примеры Sprintf','en'],
  ['Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','Почему string это байты, а символ это rune','en']]]
 ],
 q:[
  ['Что делает <code>string(65)</code>?','Возвращает «A»: число считается кодом символа Юникода, а не числом для записи цифрами.'],
  ['Как получить «65» из числа 65?','<code>strconv.Itoa(65)</code> или <code>fmt.Sprint(65)</code>.'],
  ['Как перевести <code>int64</code> в строку?','<code>strconv.FormatInt(v, 10)</code>, второй аргумент это система счисления.'],
  ['Чем <code>Sprintf</code> отличается от <code>Printf</code>?','<code>Sprintf</code> возвращает строку, а <code>Printf</code> печатает в стандартный вывод.'],
  ['Почему <code>"id: " + 5</code> не компилируется?','В Go нет неявных преобразований: нельзя складывать строку и число.'],
  ['Как получить строку из <code>[]rune</code>?','<code>string(runes)</code>: данные копируются в новую строку.']],
 quiz:[
  ['Что напечатает <code>fmt.Println(string(rune(1103)))</code>?',['1103','Я','я','ошибка'],2,'Код 1103 это кириллическая «я» (строчная). «Я» заглавная имеет код 1071.'],
  ['Как правильно получить текст «7» из <code>n := 7</code>?',['string(n)','strconv.Itoa(n)','n.String()','fmt.Print(n)'],1,'<code>Itoa</code> возвращает строку цифр. <code>string(n)</code> вернёт символ с кодом 7.'],
  ['Что вернёт <code>strconv.FormatFloat(2.0/3, \'f\', 2, 64)</code>?',['"0.66"','"0.67"','"0.7"','"0.6667"'],1,'Форматирование с двумя знаками округляет, а не отбрасывает: 0.666... превращается в 0.67.'],
  ['Какой вызов подойдёт для <code>var x int64 = 5</code>?',['strconv.Itoa(x)','strconv.FormatInt(x, 10)','string(x)','strconv.Quote(x)'],1,'<code>Itoa</code> принимает только <code>int</code>, а <code>FormatInt</code> принимает <code>int64</code>.'],
  ['Сколько будет <code>len(string([]rune{1043, 1086}))</code>?',['2','4','1','8'],1,'Две русские буквы по 2 байта в UTF-8, а <code>len</code> считает байты.'],
  ['Почему <code>"a" + 1</code> с переменной int не скомпилируется?',['Строки нельзя склеивать','Разные типы: string и int','Нужен оператор &','Число слишком мало'],1,'Go требует одинаковых типов операндов и не делает неявных преобразований.']],
 task:{
  text:'<p>Прочитай одно целое число <code>n</code> (может быть отрицательным или нулём). Преобразуй его в строку с помощью <code>strconv.Itoa</code> и выведи три строки: 1) <code>ID-</code> плюс число; 2) количество символов в строковой записи числа (минус тоже считается символом); 3) строку, повторённую два раза подряд без разделителя.</p><p>Пример ввода: <code>42</code></p><p>Пример вывода:</p><pre>ID-42\n2\n4242</pre>',
  starter:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)

	// TODO: s := строка из n (strconv.Itoa)
	// TODO: выведи "ID-" + s, затем len(s), затем s + s
	_ = strconv.Itoa
	fmt.Println(n)
}`,
  checks:[{in:'42\n',out:'ID-42\n2\n4242'},{in:'-105\n',out:'ID--105\n4\n-105-105'},{in:'0\n',out:'ID-0\n1\n00'},{in:'1000000\n',out:'ID-1000000\n7\n10000001000000'}],
  solution:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)
	s := strconv.Itoa(n)
	fmt.Println("ID-" + s)
	fmt.Println(len(s))
	fmt.Println(s + s)
}`,
  hint:'После <code>s := strconv.Itoa(n)</code> с <code>s</code> можно обращаться как с любой строкой: <code>len(s)</code> и <code>s + s</code>.'},
 l:[
  ['doc','Пакет strconv','https://pkg.go.dev/strconv','en'],
  ['doc','Спецификация: конвертации в строку и из строки','https://go.dev/ref/spec#Conversions_to_and_from_a_string_type','en'],
  ['art','Go by Example: String Formatting','https://gobyexample.com/string-formatting','en'],
  ['art','Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','en']]},
"s1-18":{b:[
 ['def',`<b>Приведение строки в число</b> (в англ. документации это <i>parsing</i>, «разбор») это получение числового значения (<code>int</code>, <code>int64</code>, <code>uint</code>, <code>float64</code>) или булева значения из текстовой записи. В Go конвертация <code>int("123")</code> <b>невозможна</b>: строка и число это разные типы, а текст может оказаться чем угодно. Поэтому разбор делают функциями пакета <code>strconv</code>: <code>Atoi</code>, <code>ParseInt</code>, <code>ParseUint</code>, <code>ParseFloat</code>, <code>ParseBool</code>. Все они возвращают <b>два значения</b>: результат и <code>error</code>. Если текст не является числом или не помещается в тип, вернётся ошибка типа <code>*strconv.NumError</code>, а результат будет нулём (или ближайшим допустимым значением при переполнении). Это ключевое отличие от динамических языков, где «5» + 1 даст результат молча.`],
 ['h','Пример'],
 ['lines',`package main

import (
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("123")
	if err != nil {
		fmt.Println("ошибка:", err)
		return
	}
	fmt.Println(n + 1)

	_, err = strconv.Atoi("12a")
	fmt.Println(err)

	f, err := strconv.ParseFloat("2.5", 64)
	fmt.Println(f*2, err)
}`,[
  ['9','<code>Atoi</code> («ASCII to integer») разбирает строку как десятичное <code>int</code>. Возвращает число и ошибку.'],
  ['10–13','Всегда проверяем <code>err</code> сразу. Если разбор не удался, число бесполезно, и мы выходим.'],
  ['14','Число стало настоящим <code>int</code>: к нему можно прибавлять 1 (получится 124).'],
  ['16','Нарочно подсовываем «12a». Результат не нужен, поэтому <code>_</code>, а ошибку сохраняем в уже существующую <code>err</code> (знак <code>=</code>, а не <code>:=</code>).'],
  ['17','Сообщение ошибки подробное: какая функция, какая строка и что не так.'],
  ['19','<code>ParseFloat(s, 64)</code>: второй аргумент это размер в битах (32 или 64). Объявляем <code>f</code> новую, а <code>err</code> переиспользуем: <code>:=</code> разрешён, потому что слева есть новая переменная.'],
  ['20','Печатаем 5 (2.5 * 2) и <code>&lt;nil&gt;</code>, то есть ошибки нет.']]],
 ['out',`124
strconv.Atoi: parsing "12a": invalid syntax
5 <nil>`],
 ['h','Зачем это нужно'],
 ['p','Всё, что приходит в бэкенд снаружи, приходит текстом: параметры URL (<code>?page=3</code>), поля формы, переменные окружения, строки CSV, аргументы командной строки. Прежде чем использовать «3» как число, его нужно разобрать, а ошибку честно обработать: пользователь может прислать что угодно. Разбор чисел из строк это одна из самых частых операций валидации в Go.'],
 ['real',5,'каждый день',[
  '<b>Query-параметры:</b> <code>page</code>, <code>limit</code>, <code>id</code> из URL разбираются через <code>Atoi</code>, при ошибке отдаётся ответ 400.',
  '<b>Переменные окружения и конфиги:</b> порт «8080», таймаут «30», флаг «true».',
  '<b>Файлы и CSV:</b> суммы, количества, координаты.',
  '<b>Командная строка:</b> числа из <code>os.Args</code>.',
  '<b>Ввод пользователя:</b> всё, что читается из <code>stdin</code>, сначала строка.']],
 ['h','1. Atoi и что он принимает'],
 ['p','<code>Atoi</code> строгий: никаких пробелов, никаких дробей, пустая строка это ошибка. Допустим знак <code>+</code> или <code>-</code> в начале.'],
 ['lines',`package main

import (
	"fmt"
	"strconv"
)

func main() {
	inputs := []string{"42", " 42", "+7", "3.5", "", "1e3", "0x1F"}
	for _, in := range inputs {
		n, err := strconv.Atoi(in)
		fmt.Printf("%q -> %d, %v\\n", in, n, err)
	}
}`,[
  ['9','Набор разных строк: от нормальных до «подозрительных».'],
  ['10','Перебираем по очереди.'],
  ['11','Каждая строка идёт в <code>Atoi</code>; при ошибке <code>n</code> равно нулю.'],
  ['12','<code>%q</code> ставит кавычки, чтобы пробелы и пустая строка были заметны; <code>%v</code> печатает ошибку или <code>&lt;nil&gt;</code>.']]],
 ['out',`"42" -> 42, <nil>
" 42" -> 0, strconv.Atoi: parsing " 42": invalid syntax
"+7" -> 7, <nil>
"3.5" -> 0, strconv.Atoi: parsing "3.5": invalid syntax
"" -> 0, strconv.Atoi: parsing "": invalid syntax
"1e3" -> 0, strconv.Atoi: parsing "1e3": invalid syntax
"0x1F" -> 0, strconv.Atoi: parsing "0x1F": invalid syntax`],
 ['p','Что видно: пробел в начале ломает разбор (сначала сделай <code>strings.TrimSpace</code>), «3.5» и «1e3» для <code>Atoi</code> не числа, шестнадцатеричная запись не принимается.'],
 ['h','2. ParseInt: система счисления и размер'],
 ['p','<code>ParseInt(s, base, bitSize)</code>: <code>base</code> это система счисления (2..36, либо 0 для автоопределения по префиксу <code>0x</code>, <code>0b</code>, <code>0o</code>), <code>bitSize</code> это размер результата (0 = <code>int</code>, 8, 16, 32, 64). Результат всегда <code>int64</code>, его нужно приводить к своему типу. Если число не помещается, вернётся ближайшее допустимое значение и ошибка <code>ErrRange</code>.'],
 ['code',`package main

import (
	"fmt"
	"strconv"
)

func main() {
	v, _ := strconv.ParseInt("ff", 16, 64)
	fmt.Println(v)

	w, err := strconv.ParseInt("300", 10, 8)
	fmt.Println(w, err)

	x, _ := strconv.ParseInt("0x1F", 0, 64)
	fmt.Println(x)

	_, err = strconv.ParseUint("-1", 10, 64)
	fmt.Println(err)
}`],
 ['out',`255
127 strconv.ParseInt: parsing "300": value out of range
31
strconv.ParseUint: parsing "-1": invalid syntax`],
 ['h','3. Как разбирать ошибки'],
 ['p','Ошибка это <code>*strconv.NumError</code> с полями <code>Func</code>, <code>Num</code> и <code>Err</code>. Причина лежит в <code>Err</code> и равна <code>strconv.ErrSyntax</code> (текст не число) или <code>strconv.ErrRange</code> (не помещается). Проверять причину нужно через <code>errors.Is</code>, а не сравнением строк.'],
 ['lines',`package main

import (
	"errors"
	"fmt"
	"strconv"
)

func main() {
	_, err := strconv.Atoi("99999999999999999999")
	fmt.Println(errors.Is(err, strconv.ErrRange))

	var ne *strconv.NumError
	if errors.As(err, &ne) {
		fmt.Println(ne.Func, ne.Num, ne.Err)
	}

	_, err = strconv.Atoi("abc")
	fmt.Println(errors.Is(err, strconv.ErrSyntax))
}`,[
  ['10','Число из 20 девяток не помещается в <code>int</code> на 64 битах.'],
  ['11','<code>errors.Is</code> видит внутри ошибки причину <code>ErrRange</code>: возвращает <code>true</code>.'],
  ['13','Заводим указатель на структуру ошибки для «разворачивания».'],
  ['14','<code>errors.As</code> проверяет, что ошибка это <code>*NumError</code>, и записывает её в <code>ne</code>.'],
  ['15','Поля: имя функции («Atoi»), исходная строка и причина. Удобно для понятных сообщений пользователю.'],
  ['18–19','Для нечисловой строки причина другая: <code>ErrSyntax</code>.']]],
 ['out',`true
Atoi 99999999999999999999 value out of range
true`],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>Atoi(" 5")</code> вернул ошибку','Пробелы не допускаются. Вызови <code>strings.TrimSpace</code> перед разбором.'],
  ['<code>Atoi("3.5")</code> ошибка','Это не целое. Используй <code>ParseFloat</code> и при необходимости приведи к <code>int</code>.'],
  ['Игнорируют ошибку: <code>n, _ := Atoi(s)</code>','Любой мусор превратится в 0, и баг не заметишь. Проверяй <code>err</code>.'],
  ['<code>ParseInt("300", 10, 8)</code> вернул 127 и ошибку','Переполнение: не помещается в int8. Результат ближайший допустимый, но доверять ему нельзя.'],
  ['Сравнивают <code>err.Error() == "..."</code>','Текст ошибки не контракт. Используй <code>errors.Is(err, strconv.ErrSyntax)</code>.'],
  ['<code>ParseBool("yes")</code> ошибка','Принимает только 1, t, T, TRUE, true, True, 0, f, F, FALSE, false, False.']]],
 ['warn','Результат при ошибке не используй. Исключение <code>ErrRange</code> (там значение «насыщается» до границы типа) нужно знать, но полагаться на него не стоит: отклоняй такой ввод целиком.'],
 ['case','Разбор параметров страницы',[
  '<p>Эндпоинт <code>GET /users?page=3&amp;limit=20</code>. Параметр <code>page</code> пришёл строкой. Если его нет или он не число, подставляем 1; если он меньше 1, тоже. Так бэкенд не падает от <code>?page=abc</code> и не отдаёт «страницу -5».</p>'].join('')],
 ['lines',`package main

import (
	"fmt"
	"strconv"
)

func parsePage(s string) int {
	n, err := strconv.Atoi(s)
	if err != nil || n < 1 {
		return 1
	}
	return n
}

func main() {
	fmt.Println(parsePage("3"), parsePage("abc"), parsePage("-5"), parsePage(""))
}`,[
  ['8','Функция принимает сырую строку из URL и всегда возвращает корректный номер страницы.'],
  ['9','Разбираем строку. Нужна и ошибка, и число.'],
  ['10–12','Любая проблема (не число, ноль, отрицательное) приводит к значению по умолчанию 1.'],
  ['13','Корректное значение возвращаем как есть.'],
  ['17','Четыре входа: нормальный, мусор, отрицательный и пустой.']]],
 ['out',`3 1 1 1`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Как перевести строку в int?</b> <code>strconv.Atoi(s)</code>, возвращает <code>(int, error)</code>. Для других размеров и систем счисления <code>ParseInt</code>.',
  '<b>Что вернёт <code>Atoi("abc")</code>?</b> Ноль и ошибку <code>*NumError</code> с причиной <code>ErrSyntax</code>.',
  '<b>Чем <code>Atoi</code> отличается от <code>ParseInt</code>?</b> <code>Atoi</code> это <code>ParseInt(s, 10, 0)</code> с приведением к <code>int</code>.',
  '<b>Как узнать, что число не поместилось?</b> <code>errors.Is(err, strconv.ErrRange)</code>.',
  '<b>Можно ли написать <code>int("5")</code>?</b> Нет, не компилируется: строку в число нужно именно разбирать.']],
 ['src',[
  ['Пакет strconv','https://pkg.go.dev/strconv','Atoi, ParseInt, ParseFloat, ParseBool, NumError','en'],
  ['Go by Example: Number Parsing','https://gobyexample.com/number-parsing','Примеры разбора чисел','en'],
  ['Пакет errors','https://pkg.go.dev/errors','Is и As для разбора ошибок','en'],
  ['Работа с ошибками в Go 1.13','https://go.dev/blog/go1.13-errors','Как устроены errors.Is и errors.As','en'],
  ['Спецификация: числовые типы','https://go.dev/ref/spec#Numeric_types','Размеры целых и вещественных типов','en']]]
 ],
 q:[
  ['Почему нельзя написать <code>int("5")</code>?','Это разные типы, а текст может не быть числом. Нужен разбор с проверкой ошибки: <code>strconv.Atoi</code>.'],
  ['Что возвращает <code>strconv.Atoi</code>?','Два значения: <code>int</code> и <code>error</code>. При ошибке число равно нулю.'],
  ['Что означают аргументы <code>ParseInt(s, base, bitSize)</code>?','<code>base</code> это система счисления (0 = по префиксу), <code>bitSize</code> это разрядность результата (0, 8, 16, 32, 64).'],
  ['Как отличить «не число» от «слишком большое»?','<code>errors.Is(err, strconv.ErrSyntax)</code> и <code>errors.Is(err, strconv.ErrRange)</code>.'],
  ['Почему <code>Atoi(" 5")</code> не работает?','Пробелы не допускаются, нужно сначала <code>strings.TrimSpace</code>.'],
  ['Почему опасно <code>n, _ := Atoi(s)</code>?','Ошибка скрывается, мусор превращается в 0 и баг остаётся незамеченным.']],
 quiz:[
  ['Что вернёт <code>strconv.Atoi("3.5")</code>?',['3','4','0 и ошибку','3.5'],2,'<code>Atoi</code> принимает только целые. Для дробей нужна <code>ParseFloat</code>.'],
  ['Какой вызов разберёт шестнадцатеричную «ff»?',['Atoi("ff")','ParseInt("ff", 16, 64)','ParseInt("ff", 10, 64)','ParseFloat("ff", 64)'],1,'Второй аргумент <code>ParseInt</code> это система счисления: 16.'],
  ['Какую проверку правильнее использовать, чтобы понять, что строка не число?',['err == nil','errors.Is(err, strconv.ErrSyntax)','err.Error() == "invalid"','n == 0'],1,'Причина лежит внутри <code>NumError</code>, а <code>errors.Is</code> умеет её находить.'],
  ['Что будет с <code>n</code> после <code>n, err := Atoi("abc")</code>?',['n равно -1','n равно 0','n не определено','программа упадёт'],1,'При ошибке результат нулевой, паники нет.'],
  ['Что вернёт <code>strconv.ParseBool("yes")</code>?',['true и nil','false и ошибку','false и nil','панику'],1,'Допустимы только 1, t, T, TRUE, true, True, 0, f, F, FALSE, false, False.'],
  ['Почему <code>ParseInt("300", 10, 8)</code> вернёт ошибку?',['база неверна','300 не помещается в int8 (-128..127)','нет знака','строка пустая'],1,'Размер результата 8 бит. Переполнение даёт <code>ErrRange</code>.']],
 task:{
  text:'<p>Первая строка ввода: целое число <code>n</code> (количество слов). Вторая строка: <code>n</code> слов через пробел. Каждое слово либо целое число, либо что-то другое. Выведи две строки: <code>sum=</code> и сумма всех слов, которые удалось разобрать как целые (<code>strconv.Atoi</code>), затем <code>bad=</code> и количество слов, которые целыми не являются.</p><p>Пример ввода:</p><pre>5\n10 abc 20 3.5 -5</pre><p>Пример вывода:</p><pre>sum=25\nbad=2</pre><p>Читай слова через <code>fmt.Scan(&amp;word)</code> в цикле.</p>',
  starter:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)

	sum, bad := 0, 0
	for i := 0; i < n; i++ {
		var word string
		fmt.Scan(&word)
		// TODO: разбери word через strconv.Atoi
		// TODO: при успехе прибавь к sum, при ошибке увеличь bad
		_ = strconv.Atoi
	}
	fmt.Println("sum=" + fmt.Sprint(sum))
	fmt.Println("bad=" + fmt.Sprint(bad))
}`,
  checks:[{in:'5\n10 abc 20 3.5 -5\n',out:'sum=25\nbad=2'},{in:'0\n',out:'sum=0\nbad=0'},{in:'3\nx y z\n',out:'sum=0\nbad=3'},{in:'4\n+7 -7 99999999999999999999 8\n',out:'sum=8\nbad=1'}],
  solution:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)

	sum, bad := 0, 0
	for i := 0; i < n; i++ {
		var word string
		fmt.Scan(&word)
		v, err := strconv.Atoi(word)
		if err != nil {
			bad++
			continue
		}
		sum += v
	}
	fmt.Println("sum=" + fmt.Sprint(sum))
	fmt.Println("bad=" + fmt.Sprint(bad))
}`,
  hint:'<code>v, err := strconv.Atoi(word)</code>: если <code>err != nil</code>, увеличь <code>bad</code>, иначе прибавь <code>v</code> к сумме.'},
 l:[
  ['doc','Пакет strconv','https://pkg.go.dev/strconv','en'],
  ['art','Go by Example: Number Parsing','https://gobyexample.com/number-parsing','en'],
  ['doc','Пакет errors (Is, As)','https://pkg.go.dev/errors','en'],
  ['art','Работа с ошибками в Go 1.13','https://go.dev/blog/go1.13-errors','en']]},

"s1-19":{b:[
 ['def',`<b>Пакет <code>fmt</code></b> («format») это пакет стандартной библиотеки Go для <b>форматированного ввода и вывода</b>. Он делает три группы вещей. Первая: печать (<code>Print</code>, <code>Println</code>, <code>Printf</code>) в стандартный вывод. Вторая: то же самое, но в строку (<code>Sprint*</code>) или в любой приёмник, который умеет писать, то есть в <code>io.Writer</code> (<code>Fprint*</code>). Третья: чтение и разбор (<code>Scan*</code>, <code>Sscan*</code>, <code>Fscan*</code>). Отдельно живёт <code>Errorf</code>, который создаёт ошибки с форматированием. Пакет опирается на интерфейсы: если у типа есть метод <code>String() string</code> (интерфейс <code>fmt.Stringer</code>), <code>fmt</code> использует его для показа значения. Он не для разбора чисел из строк (это <code>strconv</code>) и не для сложных логов (это <code>log/slog</code>).`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	name, age := "Валерия", 25
	fmt.Print("a", "b", 1, 2, "c\\n")
	fmt.Println("имя:", name, "возраст:", age)
	fmt.Printf("%s учит Go, ей %d\\n", name, age)
}`,[
  ['3','Подключаем <code>fmt</code>. Это самый используемый пакет в учебных программах.'],
  ['6','Две переменные одной строкой: строка и число.'],
  ['7','<code>Print</code> печатает аргументы подряд. Пробел между ними ставится, только если <b>оба соседа не строки</b>: между <code>1</code> и <code>2</code> он есть, а возле «b» и «c» его нет. Перевод строки надо писать самому (<code>\\n</code>).'],
  ['8','<code>Println</code> всегда ставит пробел между аргументами и перевод строки в конце. Самый удобный вариант для отладки.'],
  ['9','<code>Printf</code> печатает по шаблону: <code>%s</code> подставит строку, <code>%d</code> целое число. Перевод строки опять сами.']]],
 ['out',`ab1 2c
имя: Валерия возраст: 25
Валерия учит Go, ей 25`],
 ['h','Зачем это нужно'],
 ['p','Вывод на экран это первое, что делает любая программа, а форматирование строк (<code>Sprintf</code>, <code>Errorf</code>) используется в бэкенде постоянно: сообщения, ключи, SQL-фрагменты, ошибки с контекстом. Для production-логов обычно берут <code>log/slog</code>, но под капотом и он работает с теми же понятиями, а в учебных задачах, отладке и мелких утилитах <code>fmt</code> единственный инструмент вывода.'],
 ['real',5,'каждый день',[
  '<b>Отладка:</b> быстро посмотреть значение через <code>fmt.Println</code> или <code>%+v</code>.',
  '<b>Ошибки с контекстом:</b> <code>fmt.Errorf("загрузка профиля %d: %w", id, err)</code> это стандартный приём.',
  '<b>Сборка строк:</b> <code>Sprintf</code> для сообщений, ключей кэша, имён файлов.',
  '<b>Запись в любой приёмник:</b> <code>Fprintf(w, ...)</code> в HTTP-ответ, файл, <code>strings.Builder</code>.',
  '<b>CLI-утилиты:</b> вывод результата в <code>os.Stdout</code>, ошибок в <code>os.Stderr</code>.']],
 ['h','1. Три семейства: Print, Sprint, Fprint'],
 ['p','Буква в начале названия говорит, <b>куда</b> идёт результат: без буквы это стандартный вывод, <code>S</code> возвращает строку, <code>F</code> пишет в <code>io.Writer</code>. Суффикс говорит, <b>как</b>: без суффикса это «как есть», <code>ln</code> с пробелами и переводом строки, <code>f</code> по шаблону.'],
 ['lines',`package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	fmt.Fprintln(os.Stdout, "в стандартный вывод")
	fmt.Fprintln(os.Stderr, "в поток ошибок")
	var sb strings.Builder
	fmt.Fprintf(&sb, "id=%d;", 7)
	fmt.Fprintf(&sb, "ok=%t", true)
	fmt.Println(sb.String())
}`,[
  ['10','<code>os.Stdout</code> это обычный вывод. <code>Fprintln</code> принимает приёмник первым аргументом. Результат такой же, как у <code>Println</code>.'],
  ['11','<code>os.Stderr</code> это отдельный поток для ошибок и диагностики. В терминале ты увидишь обе строки, но в блоке вывода ниже будет только стандартный вывод: потоки разные, и их можно разделять при запуске (<code>2&gt;err.txt</code>).'],
  ['12','<code>strings.Builder</code> умеет принимать запись, значит он подходит как <code>io.Writer</code>.'],
  ['13–14','Передаём <b>указатель</b> <code>&amp;sb</code>: методы записи определены у <code>*Builder</code>. Текст копится внутри.'],
  ['15','Достаём накопленную строку целиком.']]],
 ['out',`в стандартный вывод
id=7;ok=true`],
 ['h','2. Errorf и обёртывание ошибок'],
 ['p','<code>fmt.Errorf</code> создаёт ошибку по шаблону. Глагол <code>%w</code> (wrap) <b>вкладывает</b> исходную ошибку внутрь, и потом её можно найти через <code>errors.Is</code> и <code>errors.As</code>. С <code>%v</code> вместо <code>%w</code> текст такой же, но связь с причиной потеряна.'],
 ['lines',`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("не найдено")

func find(id int) error {
	return fmt.Errorf("пользователь %d: %w", id, ErrNotFound)
}

func main() {
	err := find(5)
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNotFound))
}`,[
  ['8','Заранее объявленная «сторожевая» ошибка (sentinel error), с которой потом сравнивают.'],
  ['10','Функция, которая что-то ищет и может не найти.'],
  ['11','<code>%w</code> кладёт <code>ErrNotFound</code> внутрь новой ошибки, а в текст добавляет контекст «пользователь 5».'],
  ['15','Получаем ошибку-обёртку.'],
  ['16','Текст: контекст, двоеточие и причина.'],
  ['17','<code>errors.Is</code> «разворачивает» обёртки и находит <code>ErrNotFound</code>: <code>true</code>.']]],
 ['out',`пользователь 5: не найдено
true`],
 ['h','3. Интерфейс Stringer'],
 ['p','Если у типа есть метод <code>String() string</code>, <code>fmt</code> вызывает его при печати через <code>%v</code>, <code>%s</code> и в <code>Println</code>. Так тип сам решает, как выглядит в логах. Но для «числовых» глаголов вроде <code>%d</code> метод игнорируется.'],
 ['lines',`package main

import "fmt"

type Point struct{ X, Y int }

func (p Point) String() string {
	return fmt.Sprintf("(%d, %d)", p.X, p.Y)
}

func main() {
	p := Point{1, 2}
	fmt.Println(p)
	fmt.Printf("%v %s\\n", p, p)
	fmt.Printf("%d\\n", p)
}`,[
  ['5','Простая структура из двух целых.'],
  ['7–9','Метод <code>String</code> делает из <code>Point</code> реализацию <code>fmt.Stringer</code>. Внутри для сборки текста снова можно использовать <code>Sprintf</code> (но не печатать сам <code>p</code> через <code>%v</code>: получится бесконечная рекурсия).'],
  ['12','Создаём точку (1, 2).'],
  ['13','<code>Println</code> сам заметил <code>String()</code> и использовал его.'],
  ['14','То же для <code>%v</code> и <code>%s</code>.'],
  ['15','<code>%d</code> это формат для чисел, поэтому <code>fmt</code> печатает поля структуры по отдельности: <code>{1 2}</code>.']]],
 ['out',`(1, 2)
(1, 2) (1, 2)
{1 2}`],
 ['h','4. Разбор строки: Sscanf'],
 ['code',`package main

import "fmt"

func main() {
	var n int
	var word string
	count, err := fmt.Sscanf("10 apples", "%d %s", &n, &word)
	fmt.Println(count, err, n, word)
}`],
 ['out',`2 <nil> 10 apples`],
 ['p','<code>Sscanf</code> читает значения из строки по шаблону и записывает их по указателям (<code>&amp;n</code>). Возвращает, сколько значений разобрано, и ошибку. Чтение с клавиатуры (<code>Scan</code>, <code>Scanln</code>) работает так же, подробно в отдельной теме про ввод данных.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>Println("x=%d", 5)</code> печатает «x=%d 5»','У <code>Println</code> нет шаблонов. Нужен <code>Printf</code>. <code>go vet</code> такое ловит.'],
  ['<code>Printf("%d")</code> без аргумента печатает <code>%!d(MISSING)</code>','Аргументов меньше, чем глаголов. Паники нет, ошибка только в тексте.'],
  ['<code>Printf("%d", "hi")</code> печатает <code>%!d(string=hi)</code>','Глагол не подходит типу. Для строки <code>%s</code>, для любого значения <code>%v</code>.'],
  ['Забыли <code>\\n</code> в <code>Print</code> и <code>Printf</code>','Следующий вывод слипается с предыдущим. <code>Println</code> добавляет перевод строки сам.'],
  ['В <code>String()</code> печатают сам получатель через <code>%v</code>','Бесконечная рекурсия. Печатай поля по отдельности.'],
  ['Ошибки пишут в <code>Stdout</code>','Диагностику лучше отправлять в <code>os.Stderr</code>, чтобы не смешивать с результатом программы.']]],
 ['warn','Не передавай пользовательский текст как шаблон: <code>fmt.Printf(userInput)</code>. Если в нём окажется <code>%</code>, получится мусор в выводе, а линтеры пометят это как ошибку. Правильно: <code>fmt.Print(userInput)</code> или <code>fmt.Printf("%s", userInput)</code>.'],
 ['case','Ошибка с контекстом по цепочке слоёв',[
  '<p>В бэкенде запрос идёт через слои: обработчик, сервис, репозиторий. Репозиторий не нашёл строку в базе, а на самом верху в логе нужна полная история. Каждый слой оборачивает ошибку: <code>fmt.Errorf("сервис заказов: %w", err)</code>. В итоге в логе читается цепочка «обработчик: сервис: репозиторий: запись не найдена», а верхний слой всё ещё может сделать <code>errors.Is(err, ErrNotFound)</code> и вернуть клиенту статус 404 вместо 500.</p>'].join('')],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Чем <code>Println</code> отличается от <code>Printf</code>?</b> <code>Println</code> печатает через пробел и добавляет перевод строки; <code>Printf</code> работает по шаблону с глаголами и ничего не добавляет сам.',
  '<b>Что такое <code>fmt.Stringer</code>?</b> Интерфейс с одним методом <code>String() string</code>; <code>fmt</code> использует его при печати значения.',
  '<b>Чем <code>%w</code> отличается от <code>%v</code> в <code>Errorf</code>?</b> <code>%w</code> оборачивает ошибку так, что её можно найти через <code>errors.Is/As</code>; <code>%v</code> только вставляет текст.',
  '<b>Как записать форматированный текст в файл или HTTP-ответ?</b> <code>fmt.Fprintf(w, ...)</code>, где <code>w</code> это <code>io.Writer</code>.',
  '<b>Куда писать ошибки консольной программы?</b> В <code>os.Stderr</code>, чтобы результат в <code>stdout</code> можно было перенаправлять отдельно.']],
 ['src',[
  ['Пакет fmt','https://pkg.go.dev/fmt','Полное описание глаголов, Print, Scan, Stringer','en'],
  ['Go by Example: String Formatting','https://gobyexample.com/string-formatting','Короткие примеры форматирования','en'],
  ['Go by Example: Errors','https://gobyexample.com/errors','Как создавать ошибки','en'],
  ['Работа с ошибками в Go 1.13','https://go.dev/blog/go1.13-errors','Про %w, errors.Is и errors.As','en'],
  ['Effective Go: Printing','https://go.dev/doc/effective_go#printing','Как печатать значения и когда нужен Stringer','en']]]
 ],
 q:[
  ['Чем <code>Print</code>, <code>Println</code> и <code>Printf</code> отличаются?','<code>Print</code> печатает как есть (пробел только между не-строками), <code>Println</code> ставит пробелы и перевод строки, <code>Printf</code> форматирует по шаблону.'],
  ['Что означают буквы S и F в названии (<code>Sprintf</code>, <code>Fprintf</code>)?','<code>S</code> возвращает строку, <code>F</code> пишет в <code>io.Writer</code> (файл, HTTP-ответ, буфер).'],
  ['Для чего нужен <code>%w</code> в <code>Errorf</code>?','Он вкладывает исходную ошибку, чтобы её находили <code>errors.Is</code> и <code>errors.As</code>.'],
  ['Что такое <code>fmt.Stringer</code>?','Интерфейс с методом <code>String() string</code>; через него тип задаёт свой текстовый вид.'],
  ['Куда лучше выводить сообщения об ошибках из консольной программы?','В <code>os.Stderr</code> (например, <code>fmt.Fprintln(os.Stderr, ...)</code>).'],
  ['Что напечатает <code>fmt.Println("x=%d", 5)</code>?','<code>x=%d 5</code>: шаблоны в <code>Println</code> не работают.']],
 quiz:[
  ['Что напечатает <code>fmt.Print("a", 1, 2, "b")</code>?',['a1 2b','a 1 2 b','a12b','a1 2 b'],0,'Пробел ставится только между двумя операндами, ни один из которых не строка: то есть между 1 и 2.'],
  ['Как записать форматированный текст в переменную, а не на экран?',['fmt.Printf','fmt.Sprintf','fmt.Fprint','fmt.Sscan'],1,'<code>Sprintf</code> возвращает строку.'],
  ['Что даст <code>errors.Is(fmt.Errorf("x: %w", ErrA), ErrA)</code>?',['false','true','ошибка компиляции','паника'],1,'<code>%w</code> сохраняет связь с вложенной ошибкой.'],
  ['Что напечатает <code>fmt.Printf("%d %d\\n", 1)</code>?',['1 0','1 %!d(MISSING)','паника','1'],1,'Если аргументов не хватает, <code>fmt</code> не падает, а вставляет пометку MISSING.'],
  ['Какой метод нужен типу, чтобы <code>fmt.Println</code> печатал его по-своему?',['Print()','Format()','String() string','Show() string'],2,'Это интерфейс <code>fmt.Stringer</code>.'],
  ['Куда пишет <code>fmt.Fprintln(os.Stderr, "x")</code>?',['в стандартный вывод','в поток ошибок','в файл','никуда'],1,'<code>os.Stderr</code> это отдельный поток диагностики.']],
 task:{
  text:'<p>Прочитай имя (одно слово) и возраст (целое число) через <code>fmt.Scan</code>. Выведи две строки: 1) приветствие в формате <code>Hello, ИМЯ! Next year you will be N.</code>, где N это возраст плюс один; 2) строку, собранную через <code>fmt.Sprintf</code> в формате <code>ИМЯ:ВОЗРАСТ</code> (исходный возраст).</p><p>Пример ввода: <code>Anna 25</code></p><p>Пример вывода:</p><pre>Hello, Anna! Next year you will be 26.\nAnna:25</pre>',
  starter:`package main

import "fmt"

func main() {
	var name string
	var age int
	fmt.Scan(&name, &age)

	// TODO: выведи приветствие через fmt.Printf (не забудь \\n)
	// TODO: собери строку "ИМЯ:ВОЗРАСТ" через fmt.Sprintf и выведи
	fmt.Println(name, age)
}`,
  checks:[{in:'Anna 25\n',out:'Hello, Anna! Next year you will be 26.\nAnna:25'},{in:'Bob 0\n',out:'Hello, Bob! Next year you will be 1.\nBob:0'},{in:'Valeria 99\n',out:'Hello, Valeria! Next year you will be 100.\nValeria:99'}],
  solution:`package main

import "fmt"

func main() {
	var name string
	var age int
	fmt.Scan(&name, &age)
	fmt.Printf("Hello, %s! Next year you will be %d.\\n", name, age+1)
	s := fmt.Sprintf("%s:%d", name, age)
	fmt.Println(s)
}`,
  hint:'В <code>Printf</code> шаблон <code>"Hello, %s! ... %d.\\n"</code>, а значением для <code>%d</code> будет <code>age+1</code>.'},
 l:[
  ['doc','Пакет fmt','https://pkg.go.dev/fmt','en'],
  ['art','Go by Example: String Formatting','https://gobyexample.com/string-formatting','en'],
  ['art','Effective Go: Printing','https://go.dev/doc/effective_go#printing','en'],
  ['art','Работа с ошибками в Go 1.13','https://go.dev/blog/go1.13-errors','en']]},
"s1-20":{b:[
 ['def',`<b>Спецификатор формата</b> (в документации <code>fmt</code> его называют <i>verb</i>, «глагол») это маркер в шаблоне функций с суффиксом <code>f</code> (<code>Printf</code>, <code>Sprintf</code>, <code>Fprintf</code>, <code>Errorf</code>, <code>Sscanf</code>), который начинается со знака <code>%</code> и говорит, <b>как именно</b> показать очередной аргумент: <code>%d</code> как целое десятичное, <code>%s</code> как строку, <code>%f</code> как число с плавающей точкой, <code>%v</code> как «значение по умолчанию» для любого типа. Полная форма: <code>%[флаги][ширина][.точность]глагол</code>, например <code>%-8.2f</code>. Глагол должен подходить типу аргумента, иначе в вывод попадёт пометка вроде <code>%!d(string=hi)</code>, а программа не упадёт. Литеральный знак процента пишется как <code>%%</code>. Не путай глаголы форматирования с самими функциями: функции семейства Print выбирают, <i>куда</i> писать, а глаголы <i>как</i> показывать.`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	name := "Go"
	n := 255
	pi := 3.14159265
	ok := true
	fmt.Printf("%s %q\\n", name, name)
	fmt.Printf("%d %b %o %x %X\\n", n, n, n, n, n)
	fmt.Printf("%f %.2f %e %g\\n", pi, pi, pi, pi)
	fmt.Printf("%t %c %U\\n", ok, 'Я', 'Я')
	fmt.Printf("100%%\\n")
}`,[
  ['6–9','Четыре значения разных типов: строка, целое, дробное, булево.'],
  ['10','<code>%s</code> печатает строку как есть, <code>%q</code> берёт её в кавычки (безопасный вывод, виден пустой текст и пробелы).'],
  ['11','Одно число в разных системах: <code>%d</code> десятичная, <code>%b</code> двоичная, <code>%o</code> восьмеричная, <code>%x</code> и <code>%X</code> шестнадцатеричная в нижнем и верхнем регистре.'],
  ['12','Дробное: <code>%f</code> шесть знаков после запятой по умолчанию, <code>%.2f</code> ровно два (с округлением), <code>%e</code> научная запись, <code>%g</code> самая короткая из подходящих.'],
  ['13','<code>%t</code> печатает <code>true</code>/<code>false</code>, <code>%c</code> символ по коду руны, <code>%U</code> код в формате Юникода.'],
  ['14','Чтобы напечатать сам знак «%», его удваивают: <code>%%</code>.']]],
 ['out',`Go "Go"
255 11111111 377 ff FF
3.141593 3.14 3.141593e+00 3.14159265
true Я U+042F
100%`],
 ['h','Зачем это нужно'],
 ['p','Без точного форматирования невозможно красиво вывести деньги (две цифры после запятой), выровнять колонки отчёта, показать шестнадцатеричный хэш или записать понятный лог с типами. Чаще всего ты будешь использовать <code>%v</code>, <code>%+v</code>, <code>%d</code>, <code>%s</code>, <code>%q</code>, <code>%.2f</code> и <code>%T</code>: этих семи хватает на 95% задач.'],
 ['real',5,'каждый день',[
  '<b>Отладка структур:</b> <code>%+v</code> показывает имена полей, <code>%#v</code> код Go, <code>%T</code> тип.',
  '<b>Деньги и метрики:</b> <code>%.2f</code> для сумм и процентов.',
  '<b>Логи и ошибки:</b> <code>%q</code> для строк из пользовательского ввода (видно пробелы и спецсимволы), <code>%w</code> в <code>Errorf</code>.',
  '<b>Отчёты и таблицы:</b> ширина и выравнивание <code>%-10s</code>, <code>%8.2f</code>.',
  '<b>Хэши и байты:</b> <code>%x</code> для шестнадцатеричного вида (идентификаторы, подписи, контрольные суммы).']],
 ['h','1. Ширина, выравнивание и флаги'],
 ['p','Число после <code>%</code> задаёт минимальную ширину поля. Флаг <code>-</code> выравнивает по левому краю, <code>0</code> дополняет нулями, <code>+</code> всегда показывает знак, пробел оставляет место под знак. Точность после точки: для дробных это знаки после запятой, для строк максимальное число символов.'],
 ['lines',`package main

import "fmt"

func main() {
	fmt.Printf("|%5d|%-5d|%05d|\\n", 42, 42, 42)
	fmt.Printf("|%8.3f|%-8.2f|\\n", 3.14159, 2.5)
	fmt.Printf("|%10s|%-10s|%.3s|\\n", "go", "go", "backend")
	fmt.Printf("|%+d|% d|\\n", 5, 5)
	fmt.Printf("|%*d|\\n", 6, 7)
}`,[
  ['6','Ширина 5: <code>%5d</code> прижимает вправо, <code>%-5d</code> влево, <code>%05d</code> заполняет нулями.'],
  ['7','Ширина 8 и точность 3: <code>%8.3f</code>; <code>%-8.2f</code> выравнивает влево.'],
  ['8','Для строк то же: ширина 10 вправо и влево, а <code>%.3s</code> обрезает до трёх символов.'],
  ['9','<code>%+d</code> добавляет знак плюс, пробел-флаг оставляет под плюс пустое место.'],
  ['10','Звёздочка берёт ширину из аргумента: сначала <code>6</code>, потом значение <code>7</code>.']]],
 ['out',`|   42|42   |00042|
|   3.142|2.50    |
|        go|go        |bac|
|+5| 5|
|     7|`],
 ['h','2. Семейство %v: показать любое значение'],
 ['p','<code>%v</code> печатает значение «как принято» для типа. <code>%+v</code> у структур добавляет имена полей, <code>%#v</code> печатает как Go-код (удобно для тестов), <code>%T</code> печатает тип.'],
 ['lines',`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	u := User{"Anna", 30}
	fmt.Printf("%v\\n", u)
	fmt.Printf("%+v\\n", u)
	fmt.Printf("%#v\\n", u)
	fmt.Printf("%T %T %T\\n", u, 3.5, []string{"a"})
	fmt.Printf("%v %v\\n", []int{1, 2}, map[string]int{"a": 1})
	fmt.Printf("%q\\n", []string{"a b", "c"})
}`,[
  ['5–8','Небольшая структура пользователя.'],
  ['11','Создаём значение с позиционной инициализацией.'],
  ['12','<code>%v</code> печатает только значения в фигурных скобках.'],
  ['13','<code>%+v</code> добавляет имена полей. Самый полезный вариант для отладки структур.'],
  ['14','<code>%#v</code> показывает значение как Go-литерал вместе с именем типа.'],
  ['15','<code>%T</code> печатает тип: пользовательский <code>main.User</code>, <code>float64</code>, срез строк.'],
  ['16','Срезы и мапы печатаются целиком. У мап ключи при печати отсортированы, поэтому вывод стабильный.'],
  ['17','Глагол применяется к каждому элементу среза: <code>%q</code> взял в кавычки каждую строку.']]],
 ['out',`{Anna 30}
{Name:Anna Age:30}
main.User{Name:"Anna", Age:30}
main.User float64 []string
[1 2] map[a:1]
["a b" "c"]`],
 ['h','3. Что бывает при ошибках в шаблоне'],
 ['p','<code>fmt</code> не паникует, а встраивает диагностику прямо в вывод. Это удобно знать, чтобы быстро узнавать такие ошибки в логах.'],
 ['code',`package main

import "fmt"

func main() {
	fmt.Printf("%d\\n", "hi")
	fmt.Printf("%d %d\\n", 1)
	fmt.Printf("%d\\n", 1, 2)
	fmt.Printf("%z\\n", 3)
	fmt.Printf("%[2]s %[1]s\\n", "мир", "привет")
}`],
 ['out',`%!d(string=hi)
1 %!d(MISSING)
1
%!(EXTRA int=2)%!z(int=3)
привет мир`],
 ['p','Последняя строка показывает <b>индексы аргументов</b> <code>%[n]</code>: можно повторять и переставлять аргументы, не дублируя их в вызове. Это пригодится, например, когда одно значение нужно показать в двух форматах: <code>%[1]d %[1]x</code>.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>%!d(string=hi)</code> в выводе','Глагол не подходит типу. Для строки <code>%s</code>, для любых значений <code>%v</code>.'],
  ['<code>%!d(MISSING)</code>','Аргументов меньше, чем глаголов. Сверь количество.'],
  ['<code>%!(EXTRA int=2)</code> в конце','Лишний аргумент. Убери его или добавь глагол.'],
  ['<code>%!z(int=3)</code>','Неизвестный глагол (опечатка). <code>go vet</code> такое находит.'],
  ['Деньги выводятся как <code>%v</code> и получаются «0.30000000000000004»','Для вывода используй <code>%.2f</code>, а хранить деньги лучше в целых копейках.'],
  ['Колонки «поехали» из-за эмодзи или иероглифов','Ширина считается в рунах, а не в экранных ячейках. Широкие символы могут смещать колонки.']]],
 ['warn','Глагол <code>%d</code> на указателе напечатает адрес, а не число, на которое он указывает. Если хочешь значение, разыменуй: <code>*p</code>. Для самих указателей и адресов есть <code>%p</code>.'],
 ['case','Таблица заказов в консольном отчёте',[
  '<p>Нужно вывести список позиций так, чтобы названия были выровнены влево, количество вправо, а цена с двумя знаками после запятой. Без ширины колонки «поплывут», а <code>%v</code> для цены покажет «4.5» вместо «4.50».</p>'].join('')],
 ['lines',`package main

import "fmt"

func main() {
	items := []struct {
		name  string
		qty   int
		price float64
	}{{"Чай", 3, 4.5}, {"Кофе латте", 10, 12.25}}
	total := 0.0
	for _, it := range items {
		fmt.Printf("%-12s %3d x %7.2f\\n", it.name, it.qty, it.price)
		total += float64(it.qty) * it.price
	}
	fmt.Printf("%-12s %14.2f\\n", "Итого", total)
}`,[
  ['6–10','Срез анонимных структур: название, количество и цена. Так компактно задаём тестовые данные.'],
  ['11','Накопитель суммы: <code>0.0</code> делает его <code>float64</code>.'],
  ['12','Обходим позиции.'],
  ['13','<code>%-12s</code> название влево шириной 12, <code>%3d</code> количество, <code>%7.2f</code> цена с двумя знаками в поле шириной 7.'],
  ['14','Считаем сумму; количество приводим к <code>float64</code>, потому что Go не смешивает типы в арифметике.'],
  ['16','Итоговая строка в тех же колонках.']]],
 ['out',`Чай            3 x    4.50
Кофе латте    10 x   12.25
Итого                136.00`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Чем <code>%v</code>, <code>%+v</code> и <code>%#v</code> отличаются?</b> Просто значение, значение с именами полей, значение в виде Go-кода.',
  '<b>Как напечатать тип переменной?</b> <code>%T</code>.',
  '<b>Как вывести число с двумя знаками после запятой?</b> <code>%.2f</code>.',
  '<b>Что будет при неверном глаголе?</b> Паники нет: в вывод встроится пометка вроде <code>%!d(string=hi)</code>. <code>go vet</code> ловит такие ошибки заранее.',
  '<b>Как напечатать знак процента?</b> <code>%%</code>.']],
 ['src',[
  ['fmt: Printing (глаголы, флаги, ширина)','https://pkg.go.dev/fmt#hdr-Printing','Полная таблица глаголов','en'],
  ['Go by Example: String Formatting','https://gobyexample.com/string-formatting','Примеры самых частых глаголов','en'],
  ['Effective Go: Printing','https://go.dev/doc/effective_go#printing','%v, %+v, %#v, %T и Stringer','en'],
  ['A Tour of Go: основы','https://go.dev/tour/basics/1','Первые шаги с Printf в Tour of Go','en'],
  ['go vet: printf','https://pkg.go.dev/cmd/vet','Проверки шаблонов форматирования','en']]]
 ],
 q:[
  ['Что делает флаг <code>-</code> в <code>%-10s</code>?','Выравнивает по левому краю в поле шириной 10.'],
  ['Как выбрать число знаков после запятой?','Точностью: <code>%.2f</code> даёт два знака с округлением.'],
  ['Чем <code>%+v</code> полезен?','Показывает имена полей структуры, удобно для отладки.'],
  ['Как напечатать тип значения?','<code>%T</code>.'],
  ['Что покажет <code>fmt</code> при неподходящем глаголе?','Пометку вида <code>%!d(string=hi)</code> прямо в выводе, без паники.'],
  ['Как вывести символ «%»?','Удвоить: <code>%%</code>.']],
 quiz:[
  ['Что напечатает <code>fmt.Printf("%05d", 42)</code>?',['42000','00042','42   ','   42'],1,'Флаг <code>0</code> дополняет нулями слева до ширины 5.'],
  ['Какой глагол покажет строку в кавычках?',['%s','%q','%v','%c'],1,'<code>%q</code> это quoted: строка в кавычках с экранированием.'],
  ['Что напечатает <code>fmt.Printf("%.2f", 3.14159)</code>?',['3.14','3.15','3.1','3.141'],0,'Две цифры после точки, остаток 0.00159 меньше половины, поэтому округление вниз.'],
  ['Что делает <code>%[1]d %[1]x</code> с одним аргументом 255?',['ошибка','255 ff','255 255','ff ff'],1,'Индекс <code>[1]</code> переиспользует первый аргумент в двух форматах.'],
  ['Что напечатает <code>fmt.Printf("%d\\n", "7")</code>?',['7','%!d(string=7)','0','ошибка компиляции'],1,'Строке нужен <code>%s</code>. <code>fmt</code> вставляет диагностику в вывод.'],
  ['Какой глагол самый универсальный для любого значения?',['%a','%v','%i','%n'],1,'<code>%v</code> выбирает формат по типу значения.']],
 task:{
  text:'<p>Прочитай через <code>fmt.Scan</code> название товара (одно слово), количество (целое) и цену (дробное). Выведи две строки.</p><p>1) <code>|</code>, название влево в поле шириной 10, <code>|</code>, количество вправо в поле шириной 4, <code>|</code>, цена с двумя знаками после запятой вправо в поле шириной 8, <code>|</code>.</p><p>2) <code>Total: </code> и сумма (количество умножить на цену) с двумя знаками после запятой.</p><p>Пример ввода: <code>Tea 3 4.5</code></p><p>Пример вывода:</p><pre>|Tea       |   3|    4.50|\nTotal: 13.50</pre>',
  starter:`package main

import "fmt"

func main() {
	var name string
	var qty int
	var price float64
	fmt.Scan(&name, &qty, &price)

	// TODO: напечатай строку таблицы через Printf с шириной полей
	// TODO: напечатай итог с двумя знаками после запятой
	fmt.Println(name, qty, price)
}`,
  checks:[{in:'Tea 3 4.5\n',out:'|Tea       |   3|    4.50|\nTotal: 13.50'},{in:'Coffee 8 1.25\n',out:'|Coffee    |   8|    1.25|\nTotal: 10.00'},{in:'Cappuccino-large 1 100\n',out:'|Cappuccino-large|   1|  100.00|\nTotal: 100.00'},{in:'Free 0 0\n',out:'|Free      |   0|    0.00|\nTotal: 0.00'}],
  solution:`package main

import "fmt"

func main() {
	var name string
	var qty int
	var price float64
	fmt.Scan(&name, &qty, &price)
	fmt.Printf("|%-10s|%4d|%8.2f|\\n", name, qty, price)
	fmt.Printf("Total: %.2f\\n", float64(qty)*price)
}`,
  hint:'Шаблон строки таблицы: <code>"|%-10s|%4d|%8.2f|\\n"</code>. Сумму считай как <code>float64(qty)*price</code>.'},
 l:[
  ['doc','fmt: форматирование вывода (все глаголы)','https://pkg.go.dev/fmt#hdr-Printing','en'],
  ['art','Go by Example: String Formatting','https://gobyexample.com/string-formatting','en'],
  ['art','Effective Go: Printing','https://go.dev/doc/effective_go#printing','en'],
  ['doc','go vet (проверка printf-шаблонов)','https://pkg.go.dev/cmd/vet','en']]},

"s1-21":{b:[
 ['def',`<b><code>rune</code></b> это встроенный тип Go, <b>псевдоним (alias) для <code>int32</code></b>, который хранит один <b>кодовый пункт Юникода</b> (code point), то есть номер символа в таблице Юникода. Руны записываются в одинарных кавычках: <code>'a'</code>, <code>'Я'</code>, <code>'\\n'</code>. Строка <code>string</code> в Go это последовательность <b>байт</b> в кодировке UTF-8, где один символ занимает от 1 до 4 байт, а руна это один «целый» символ. Рядом стоит <code>byte</code> (псевдоним <code>uint8</code>), который хранит один байт. Различие критично для русского и других нелатинских текстов: <code>len("Привет")</code> равен 12 (байт), а рун в слове 6. Не путай: литерал <code>'a'</code> это руна (число 97), а <code>"a"</code> это строка.`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	var r rune = 'Я'
	fmt.Println(r)
	fmt.Println(string(r))
	fmt.Printf("%c %U %T\\n", r, r, r)
	b := byte('A')
	fmt.Println(b, string(b))
	fmt.Println('a' + 1)
	fmt.Println(string(rune('a' + 1)))
}`,[
  ['6','Переменная типа <code>rune</code> с буквой «Я». Одинарные кавычки значат «один символ».'],
  ['7','<code>Println</code> печатает руну как <b>число</b>: 1071 это код «Я» в Юникоде.'],
  ['8','Чтобы увидеть символ, руну превращают в строку: <code>string(r)</code>. Для рун и <code>byte</code> такая конвертация даёт символ, а не цифры.'],
  ['9','<code>%c</code> печатает символ, <code>%U</code> код в виде <code>U+042F</code>, <code>%T</code> тип: <code>int32</code> (так как <code>rune</code> лишь другое имя).'],
  ['10','<code>byte</code> это один байт: латинская «A» помещается в него (код 65).'],
  ['11','Строка из одного байта «A» и число 65.'],
  ['12','Арифметика над символами работает как над числами: <code>\'a\' + 1</code> это 98, число, а не «b».'],
  ['13','Чтобы получить «b», результат превращают обратно в руну и затем в строку.']]],
 ['out',`1071
Я
Я U+042F int32
65 A
98
b`],
 ['h','Зачем это нужно'],
 ['p','Как только в программу попадает русский текст, эмодзи или символы других языков, посимвольная работа со строкой через индексы <code>s[i]</code> ломается. Руны это правильный способ «видеть» символы. В повседневной бэкенд-разработке руны встречаются реже, чем <code>string</code> и <code>int</code>, но они обязательны там, где нужна работа с символами: валидации, подсчёт длины для пользователя, разбор формата.'],
 ['real',3,'иногда',[
  '<b>Валидация текста:</b> «имя не длиннее 50 символов» должно считать символы, а не байты (<code>utf8.RuneCountInString</code>).',
  '<b>Проверка символов:</b> цифра, буква, пробел, заглавная (<code>unicode.IsDigit</code>, <code>IsLetter</code>, <code>IsUpper</code>).',
  '<b>Обрезка текста:</b> сократить описание до 100 <b>символов</b> с многоточием, не разрезав букву пополам.',
  '<b>Разворот и сравнение:</b> палиндромы, транслитерация, формирование слагов (латинизация имён).',
  '<b>Парсеры и лексеры:</b> разбор форматов по символам (запросы, шаблоны, мини-языки).']],
 ['h','1. Байты и руны в строке: индексация и range'],
 ['p','Индекс <code>s[i]</code> возвращает <b>байт</b>. Цикл <code>for i := 0; i &lt; len(s); i++</code> идёт по байтам. А цикл <code>for i, r := range s</code> декодирует UTF-8 и выдаёт <b>руны</b>, причём <code>i</code> это позиция начала символа в байтах.'],
 ['lines',`package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	s := "Go Я"
	fmt.Println(len(s))
	for i := 0; i < len(s); i++ {
		fmt.Print(s[i], " ")
	}
	fmt.Println()
	for i, r := range s {
		fmt.Printf("%d:%c ", i, r)
	}
	fmt.Println()
	fmt.Println(utf8.RuneCountInString(s), len([]rune(s)))
}`,[
  ['5','Пакет <code>unicode/utf8</code> умеет считать и проверять руны в строках.'],
  ['9','Три латинских символа (с пробелом) и одна русская буква.'],
  ['10','<code>len</code> считает байты: 2 + 1 + 2 = 5.'],
  ['11–13','Обычный цикл по индексам даёт отдельные байты. Буква «Я» превращается в два числа: 208 и 175 (её UTF-8 представление).'],
  ['14','Перевод строки после предыдущей печати.'],
  ['15–17','<code>range</code> по строке читает UTF-8 и выдаёт руны. Индекс <code>i</code> прыгает с 3 сразу к концу: он показывает байтовую позицию начала символа.'],
  ['18','Ещё один перевод строки.'],
  ['19','Два способа посчитать символы: <code>utf8.RuneCountInString</code> (быстрее, без копирования) и <code>len([]rune(s))</code> (создаёт срез рун).']]],
 ['out',`5
71 111 32 208 175
0:G 1:o 2:  3:Я
4 4`],
 ['h','2. Срез рун: развернуть и обрезать по символам'],
 ['p','Конвертация <code>[]rune(s)</code> раскладывает строку на руны, с которыми можно работать по индексам и менять их. Обратная конвертация <code>string(runes)</code> собирает строку.'],
 ['lines',`package main

import "fmt"

func reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func main() {
	fmt.Println(reverse("Привет, мир"))
	fmt.Println(reverse("Go"))
}`,[
  ['5','Функция принимает строку и возвращает развёрнутую.'],
  ['6','Раскладываем в срез рун: теперь каждый элемент это один символ, а не байт.'],
  ['7','Два индекса идут навстречу друг другу с краёв к середине.'],
  ['8','Меняем элементы местами: в Go это одна строка без временной переменной.'],
  ['10','Склеиваем руны обратно в строку. Если бы мы развернули байты, русские буквы превратились бы в мусор.'],
  ['14–15','Проверяем на кириллице и на латинице.']]],
 ['out',`рим ,тевирП
oG`],
 ['h','3. Пакет unicode: что это за символ'],
 ['lines',`package main

import (
	"fmt"
	"unicode"
)

func main() {
	text := "Go 1.24: Привет!"
	var letters, digits, spaces, other int
	for _, r := range text {
		switch {
		case unicode.IsLetter(r):
			letters++
		case unicode.IsDigit(r):
			digits++
		case unicode.IsSpace(r):
			spaces++
		default:
			other++
		}
	}
	fmt.Println(letters, digits, spaces, other)
	fmt.Println(string(unicode.ToUpper('я')), unicode.IsUpper('Я'))
}`,[
  ['9','Смешанная строка: латиница, цифры, знаки, кириллица.'],
  ['10','Четыре счётчика сразу в одной строке.'],
  ['11','Проходим по рунам. Нижнее подчёркивание вместо индекса, он не нужен.'],
  ['12–20','<code>switch</code> без условия работает как цепочка <code>if</code>: первая подошедшая ветка срабатывает. <code>IsLetter</code> знает буквы всех алфавитов, <code>IsDigit</code> цифры, <code>IsSpace</code> пробелы и переводы строк.'],
  ['23','Итог: 8 букв (две латинские и шесть русских), 3 цифры, 2 пробела и 3 прочих знака.'],
  ['24','<code>ToUpper</code> принимает и возвращает руну, а <code>IsUpper</code> проверяет заглавность.']]],
 ['out',`8 3 2 3
Я true`],
 ['h','4. Невалидный UTF-8'],
 ['code',`package main

import "fmt"

func main() {
	s := "a\\xffb"
	for i, r := range s {
		fmt.Println(i, r)
	}
}`],
 ['out',`0 97
1 65533
2 98`],
 ['p','Байт <code>\\xff</code> не может быть началом корректной последовательности UTF-8. <code>range</code> не падает, а выдаёт символ замены <code>U+FFFD</code> (число 65533) и идёт дальше. Данные из внешнего мира могут быть «битыми»: проверить строку можно через <code>utf8.ValidString</code>.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>len("Привет")</code> вернул 12, а не 6','<code>len</code> считает байты. Для символов: <code>utf8.RuneCountInString(s)</code>.'],
  ['<code>s[0]</code> для «Привет» напечатал 208','Индекс даёт байт, а не символ. Для первой буквы: <code>[]rune(s)[0]</code> или <code>range</code>.'],
  ['<code>string(s[0])</code> показал «Ð» вместо «П»','Байт был превращён в руну и показан как отдельный символ Latin-1. Работай с рунами.'],
  ['<code>var r rune = "Я"</code> не компилируется','У руны одинарные кавычки: <code>\'Я\'</code>. Двойные кавычки это строка.'],
  ['<code>\'ab\'</code> не компилируется','В одинарных кавычках ровно один символ. Несколько символов это строка в двойных.'],
  ['После <code>[]rune(s)</code> и обратно эмодзи «с цветом кожи» разваливается','Один видимый символ может состоять из нескольких рун (составные эмодзи, комбинируемые знаки). Руна это кодовый пункт, а не всегда «буква глазами».']]],
 ['warn','<code>rune</code> и <code>byte</code> это только другие имена для <code>int32</code> и <code>uint8</code>. Компилятор различает их лишь по смыслу в коде, а <code>fmt</code> печатает как числа, пока не попросишь <code>%c</code> или <code>string(...)</code>.'],
 ['case','Ограничение длины описания в символах',[
  '<p>В форме профиля поле «О себе» не должно быть длиннее 140 символов. Если проверять <code>len(text) &gt; 140</code>, пользователь из России сможет ввести лишь около 70 русских букв, потому что каждая весит 2 байта. Правильно: <code>utf8.RuneCountInString(text) &gt; 140</code>. А при сокращении для превью сначала переходят к <code>[]rune</code>, режут по рунам и добавляют «…».</p>'].join('')],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Что такое <code>rune</code>?</b> Псевдоним <code>int32</code>, один кодовый пункт Юникода.',
  '<b>Чем <code>byte</code> отличается от <code>rune</code>?</b> <code>byte</code> это <code>uint8</code> (один байт), <code>rune</code> это <code>int32</code> (один символ Юникода, в UTF-8 от 1 до 4 байт).',
  '<b>Что вернёт <code>len("Привет")</code>?</b> 12, это число байт. Число символов 6.',
  '<b>Что выдаёт <code>for i, r := range s</code>?</b> Руны, а <code>i</code> это байтовое смещение начала руны.',
  '<b>Как развернуть строку с кириллицей?</b> Через <code>[]rune</code>, а не через байты.']],
 ['src',[
  ['Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','Официальный разбор: UTF-8, byte и rune','en'],
  ['Спецификация: типы rune и числовые типы','https://go.dev/ref/spec#Numeric_types','Rune как псевдоним int32','en'],
  ['Пакет unicode','https://pkg.go.dev/unicode','IsLetter, IsDigit, IsUpper, ToUpper','en'],
  ['Пакет unicode/utf8','https://pkg.go.dev/unicode/utf8','RuneCountInString, ValidString, DecodeRuneInString','en'],
  ['Go by Example: Strings and Runes','https://gobyexample.com/strings-and-runes','Короткие примеры про руны','en']]]
 ],
 q:[
  ['Что такое <code>rune</code>?','Псевдоним <code>int32</code>: один кодовый пункт Юникода. Литералы в одинарных кавычках.'],
  ['Почему <code>len("Привет")</code> равно 12?','<code>len</code> считает байты, а русская буква в UTF-8 занимает 2 байта.'],
  ['Как посчитать символы?','<code>utf8.RuneCountInString(s)</code> или <code>len([]rune(s))</code>.'],
  ['Что даёт <code>range</code> по строке?','Пары (байтовая позиция, руна). UTF-8 декодируется автоматически.'],
  ['Чем <code>\'a\'</code> отличается от <code>"a"</code>?','<code>\'a\'</code> это руна (число 97), <code>"a"</code> это строка.'],
  ['Как развернуть строку с русскими буквами?','Перевести в <code>[]rune</code>, развернуть срез и обратно в <code>string</code>.']],
 quiz:[
  ['Какой тип у литерала <code>\'Я\'</code> по умолчанию?',['string','byte','rune (int32)','uint16'],2,'Символьный литерал это руна, по умолчанию <code>rune</code>, то есть <code>int32</code>.'],
  ['Что напечатает <code>fmt.Println(len("Go Я"))</code>?',['4','5','6','3'],1,'G, o и пробел по байту, «Я» два байта: 5.'],
  ['Что напечатает <code>fmt.Println(\'a\' + 1)</code>?',['b','98','a1','ошибка'],1,'Это арифметика над числом 97, получается число 98.'],
  ['Что даст <code>s[0]</code> для <code>s := "Привет"</code>?',['rune П','byte 208','string "П"','ошибка'],1,'Индексация строки даёт байт, а «П» это 2 байта (208 и 159).'],
  ['Как правильно взять первые 3 символа строки с кириллицей?',['s[:3]','string([]rune(s)[:3])','s[0:6]','strings.Left(s, 3)'],1,'Срез по рунам не разрежет букву пополам.'],
  ['Какое число выдаст <code>range</code> для невалидного байта?',['0','255','65533 (U+FFFD)','панику'],2,'Невалидный UTF-8 заменяется на символ замены U+FFFD.']],
 task:{
  text:'<p>Прочитай одну строку целиком (<code>bufio.Scanner</code>). Выведи три строки: 1) количество <b>байт</b>; 2) количество <b>символов</b> (рун); 3) строку, развёрнутую по символам.</p><p>Пример ввода: <code>Привет</code></p><p>Пример вывода:</p><pre>12\n6\nтевирП</pre>',
  starter:`package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	s := scanner.Text()

	// TODO: выведи len(s)
	// TODO: выведи количество рун
	// TODO: развернуть через []rune и выведи
	fmt.Println(s)
}`,
  checks:[{in:'Привет\n',out:'12\n6\nтевирП'},{in:'Go\n',out:'2\n2\noG'},{in:'Я люблю Go\n',out:'16\n10\noG юлбюл Я'},{in:'x\n',out:'1\n1\nx'}],
  solution:`package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	s := scanner.Text()
	r := []rune(s)
	fmt.Println(len(s))
	fmt.Println(len(r))
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	fmt.Println(string(r))
}`,
  hint:'Сначала <code>r := []rune(s)</code>. Количество рун это <code>len(r)</code>, а разворот делается обменом элементов с двух концов.'},
 l:[
  ['art','Strings, bytes, runes and characters in Go','https://go.dev/blog/strings','en'],
  ['art','Go by Example: Strings and Runes','https://gobyexample.com/strings-and-runes','en'],
  ['doc','Пакет unicode','https://pkg.go.dev/unicode','en'],
  ['doc','Пакет unicode/utf8','https://pkg.go.dev/unicode/utf8','en']]},
"s1-22":{b:[
 ['def',`<b>Указатель</b> (в спецификации Go <i>pointer type</i>, <code>*T</code>) это значение, которое хранит <b>адрес в памяти</b> другой переменной типа <code>T</code>. Оператор <code>&amp;x</code> («взять адрес») даёт указатель на переменную <code>x</code>, а оператор <code>*p</code> («разыменование») даёт саму переменную, на которую указывает <code>p</code>. Нулевое значение любого указателя это <code>nil</code> («никуда не указывает»). Главное отличие от языка C: в Go <b>нет арифметики указателей</b> (нельзя прибавить к адресу 4) и сборщик мусора сам следит за временем жизни данных, поэтому указатель на локальную переменную безопасно возвращать из функции. Указатель не равен ссылке из других языков: в Go всё передаётся <b>по значению</b>, а указатель это просто значение, которое копируется вместе с адресом.`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	x := 10
	p := &x
	fmt.Println(x, *p)
	*p = 20
	fmt.Println(x)
	fmt.Println(p == &x)
	fmt.Printf("%T\\n", p)
}`,[
  ['6','Обычная переменная <code>x</code> со значением 10, живущая где-то в памяти.'],
  ['7','<code>&amp;x</code> берёт адрес <code>x</code>. Теперь <code>p</code> типа <code>*int</code> («указатель на int») знает, где лежит <code>x</code>.'],
  ['8','<code>*p</code> читает значение по адресу, то есть 10. Обе записи показывают одно и то же число.'],
  ['9','Присваиваем через указатель: меняется сама переменная <code>x</code>, а не копия.'],
  ['10','Проверяем: <code>x</code> теперь 20. Именно ради такого эффекта указатели и нужны.'],
  ['11','Указатели можно сравнивать: они равны, если указывают на одну и ту же переменную.'],
  ['12','<code>%T</code> печатает тип указателя: <code>*int</code>.']]],
 ['out',`10 10
20
true
*int`],
 ['h','Зачем это нужно'],
 ['p','Без указателей функция получает <b>копию</b> аргумента и не может изменить оригинал. Указатели решают три задачи: <b>изменение</b> данных вызывающего кода, <b>отсутствие копирования</b> больших структур и <b>выражение «значения нет»</b> (<code>nil</code>). В Go-коде бэкенда они встречаются постоянно, особенно в методах структур и при работе с базой и JSON.'],
 ['real',5,'каждый день',[
  '<b>Методы структур:</b> <code>func (s *Server) Start()</code>, получатель-указатель позволяет менять состояние объекта.',
  '<b>Большие структуры:</b> передавать <code>*Config</code> вместо копии на сотню байт.',
  '<b>Необязательные поля:</b> <code>*string</code> и <code>*int</code> в запросах и ответах, чтобы отличить «не передано» от «пустое».',
  '<b>Чтение из базы и JSON:</b> функции типа <code>Scan(&amp;x)</code> и <code>json.Unmarshal(data, &amp;v)</code> требуют указатель, чтобы записать результат.',
  '<b>Разделяемые объекты:</b> один пул соединений или один кэш, на которые ссылаются разные части программы.']],
 ['h','1. Передача по значению и по указателю'],
 ['p','Параметр функции это <b>локальная копия</b> аргумента. Если передать число, функция правит копию. Если передать указатель, копируется адрес, но он по-прежнему ведёт к той же переменной.'],
 ['lines',`package main

import "fmt"

func incByValue(n int) {
	n++
}

func incByPointer(n *int) {
	*n++
}

func main() {
	a := 1
	incByValue(a)
	fmt.Println(a)
	incByPointer(&a)
	fmt.Println(a)
}`,[
  ['5–7','Получает копию числа и увеличивает копию. Оригинал не трогается.'],
  ['9–11','Получает адрес и увеличивает значение <b>по этому адресу</b>. <code>*n++</code> читается как «увеличить то, на что указывает n».'],
  ['14','Переменная в <code>main</code>.'],
  ['15–16','После вызова по значению <code>a</code> остался 1.'],
  ['17–18','Передали <code>&amp;a</code>: функция изменила оригинал, теперь 2.']]],
 ['out',`1
2`],
 ['h','2. Указатели на структуры и методы'],
 ['p','Для указателя на структуру Go разрешает писать <code>p.Field</code> вместо <code>(*p).Field</code>: разыменование происходит автоматически. Так выглядит почти весь код с указателями на практике.'],
 ['lines',`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func birthday(u *User) {
	u.Age++
}

func main() {
	u := User{"Anna", 30}
	birthday(&u)
	fmt.Println(u)
	pu := &u
	pu.Name = "Bob"
	fmt.Println(u.Name, (*pu).Age)
}`,[
  ['5–8','Структура пользователя.'],
  ['10–12','Функция принимает указатель и меняет поле. Запись <code>u.Age</code> сама разыменует указатель.'],
  ['15','Обычная переменная-структура.'],
  ['16','Передаём адрес, поэтому изменение дойдёт до <code>u</code>.'],
  ['17','Возраст стал 31.'],
  ['18','Создаём указатель на ту же структуру.'],
  ['19','Правим поле через указатель: меняется оригинал.'],
  ['20','<code>(*pu).Age</code> это полная запись; <code>pu.Age</code> делает то же самое.']]],
 ['out',`{Anna 31}
Bob 31`],
 ['h','3. Ловушка range: элемент это копия'],
 ['p','В <code>for _, u := range users</code> переменная <code>u</code> это <b>копия</b> элемента. Изменения копии не попадают в срез. Нужно менять через индекс (или хранить указатели).'],
 ['lines',`package main

import "fmt"

type User struct {
	Name string
	Age  int
}

func main() {
	users := []User{{"A", 1}, {"B", 2}}
	for _, u := range users {
		u.Age += 10
	}
	fmt.Println(users)
	for i := range users {
		users[i].Age += 10
	}
	fmt.Println(users)
}`,[
  ['5–8','Структура пользователя, как в прошлом примере.'],
  ['11','Срез из двух пользователей.'],
  ['12–14','Копия <code>u</code> получает +10, оригинал остаётся прежним. Частая ошибка новичков.'],
  ['15','Видим, что возрасты не изменились: <code>[{A 1} {B 2}]</code>.'],
  ['16–18','Правильно: обращаемся к элементу по индексу <code>users[i]</code>.'],
  ['19','Теперь изменения видны.']]],
 ['out',`[{A 1} {B 2}]
[{A 11} {B 12}]`],
 ['h','4. Разыменование nil: паника'],
 ['p','Указатель, который никуда не указывает (<code>nil</code>), нельзя разыменовывать: программа падает с паникой «invalid memory address or nil pointer dereference». Это самая частая паника в Go-программах.'],
 ['code',`package main

import "fmt"

func main() {
	var p *int
	fmt.Println(p == nil)
	fmt.Println(*p)
}`],
 ['out',`true
panic: runtime error: invalid memory address or nil pointer dereference
…`],
 ['p','Продолжение вывода это трассировка стека (имя горутины и место падения), она зависит от системы и здесь обрезана. Защита простая: проверять <code>p != nil</code> там, где указатель мог не быть задан.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>panic: nil pointer dereference</code>','Разыменовали <code>nil</code>. Проверь <code>if p != nil</code> или убедись, что значение создано.'],
  ['Функция изменила аргумент, а снаружи ничего не поменялось','Передали значение, а не указатель. Для изменения нужен <code>*T</code> и вызов с <code>&amp;x</code>.'],
  ['Изменения в <code>for _, v := range</code> «пропадают»','<code>v</code> это копия. Меняй через <code>s[i]</code>.'],
  ['<code>p++</code> на указателе не компилируется','В Go нет арифметики указателей. Для обхода данных есть срезы.'],
  ['Указатель на элемент среза «ломается» после <code>append</code>','При росте среза данные могут переехать в новый массив, старый указатель смотрит в старый. Не храни такие указатели.'],
  ['Всё передают указателями «чтобы быстрее»','Для небольших структур копия обычно дешевле и безопаснее. Указатель нужен для изменения и для больших типов.']]],
 ['warn','В Go нельзя изменить данные в аргументе, не передав указатель, но <b>срезы, мапы и каналы</b> уже внутри содержат ссылку на данные, поэтому их изменения видны и без явных указателей (хотя сам срез при <code>append</code> лучше возвращать).'],
 ['case','Метод счётчика: получатель-указатель против значения',[
  '<p>Структура хранит счётчик запросов. Метод с получателем-значением работает с копией и ничего не меняет, а с получателем-указателем меняет оригинал. Поэтому методы, меняющие состояние, почти всегда объявляют на <code>*T</code>.</p>'].join('')],
 ['lines',`package main

import "fmt"

type Counter struct{ n int }

func (c *Counter) Inc() {
	c.n++
}

func (c Counter) IncBad() {
	c.n++
}

func main() {
	var c Counter
	c.Inc()
	c.Inc()
	c.IncBad()
	fmt.Println(c.n)
}`,[
  ['5','Структура с одним полем.'],
  ['7–9','Получатель <code>*Counter</code>: метод видит оригинал и увеличивает поле.'],
  ['11–13','Получатель <code>Counter</code>: метод получает копию, и её изменение никому не видно.'],
  ['16','Обычная переменная; Go сам берёт её адрес для <code>c.Inc()</code>.'],
  ['17–18','Два увеличения оригинала.'],
  ['19','Увеличение копии, результат теряется.'],
  ['20','Итог 2, а не 3.']]],
 ['out',`2`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Что такое указатель?</b> Значение, хранящее адрес другой переменной; <code>&amp;x</code> берёт адрес, <code>*p</code> разыменовывает.',
  '<b>Передаются ли аргументы в Go по ссылке?</b> Нет, всегда по значению. Указатель это значение-адрес, которое копируется.',
  '<b>Есть ли в Go арифметика указателей?</b> Нет (кроме небезопасного пакета <code>unsafe</code>).',
  '<b>Когда нужен получатель-указатель?</b> Когда метод меняет состояние, когда структура большая, и для единообразия, если хоть один метод типа уже на указателе.',
  '<b>Что будет при разыменовании nil-указателя?</b> Паника <code>nil pointer dereference</code>.']],
 ['src',[
  ['A Tour of Go: Pointers','https://go.dev/tour/moretypes/1','Первое знакомство с указателями','en'],
  ['Go by Example: Pointers','https://gobyexample.com/pointers','Передача по значению и по указателю','en'],
  ['Спецификация: типы-указатели','https://go.dev/ref/spec#Pointer_types','Формальное определение','en'],
  ['Go FAQ: методы на значениях и указателях','https://go.dev/doc/faq#methods_on_values_or_pointers','Когда выбирать *T','en'],
  ['100 Go Mistakes','https://100go.co','Ошибки с указателями и получателями','en']]]
 ],
 q:[
  ['Что делают операторы <code>&amp;</code> и <code>*</code>?','<code>&amp;x</code> даёт адрес переменной, <code>*p</code> разыменовывает: даёт значение по адресу.'],
  ['Почему функция не меняет число, переданное по значению?','Получает копию. Нужен указатель, чтобы менять оригинал.'],
  ['Чему равен нулевой указатель?','<code>nil</code>. Разыменование вызывает панику.'],
  ['Есть ли в Go арифметика указателей?','Нет, <code>p++</code> не скомпилируется (кроме <code>unsafe</code>).'],
  ['Почему в <code>for _, u := range users</code> изменения <code>u</code> не видны?','<code>u</code> это копия элемента. Менять надо через <code>users[i]</code>.'],
  ['Когда у метода должен быть получатель-указатель?','Когда он меняет объект или объект большой.']],
 quiz:[
  ['Что напечатает код: <code>a := 1; p := &a; *p = 5; fmt.Println(a)</code>?',['1','5','адрес','ошибка'],1,'Присваивание через указатель меняет саму переменную <code>a</code>.'],
  ['Какой тип у <code>&x</code>, если <code>x</code> это <code>int</code>?',['int','*int','&int','ptr'],1,'Указатель на <code>int</code> записывается <code>*int</code>.'],
  ['Что произойдёт: <code>var p *int; fmt.Println(*p)</code>?',['0','nil','паника nil pointer dereference','ошибка компиляции'],2,'Разыменование <code>nil</code> приводит к панике времени выполнения.'],
  ['Что станет с <code>users</code>: <code>for _, u := range users { u.Age++ }</code>?',['все возрасты +1','ничего не изменится','ошибка компиляции','паника'],1,'<code>u</code> это копия, оригинал остаётся прежним.'],
  ['Как передать функции возможность изменить структуру?',['по значению','указателем на неё','через return nil','ничего не нужно'],1,'Указатель даёт функции доступ к оригиналу.'],
  ['Что верно про Go?',['Есть арифметика указателей','Аргументы передаются по ссылке','Все аргументы передаются по значению','Указатели нельзя возвращать из функции'],2,'В Go всё по значению, а указатель это значение-адрес. Возвращать указатель на локальную переменную можно.']],
 task:{
  text:'<p>Прочитай два целых числа <code>a</code> и <code>b</code> (через пробел). Напиши функцию <code>swap(x, y *int)</code>, которая меняет значения местами, и функцию <code>addTo(p *int, d int)</code>, которая прибавляет <code>d</code> к значению по указателю. Вызови <code>swap(&amp;a, &amp;b)</code>, затем <code>addTo(&amp;a, 10)</code> и выведи <code>a</code> и <code>b</code> через пробел.</p><p>Пример ввода: <code>3 7</code></p><p>Пример вывода: <code>17 3</code> (после обмена a=7, b=3, затем a=17).</p>',
  starter:`package main

import "fmt"

// TODO: swap меняет значения, на которые указывают x и y
func swap(x, y *int) {
}

// TODO: addTo прибавляет d к значению по указателю p
func addTo(p *int, d int) {
}

func main() {
	var a, b int
	fmt.Scan(&a, &b)
	swap(&a, &b)
	addTo(&a, 10)
	fmt.Println(a, b)
}`,
  checks:[{in:'3 7\n',out:'17 3'},{in:'-5 5\n',out:'15 -5'},{in:'0 0\n',out:'10 0'},{in:'100 -100\n',out:'-90 100'}],
  solution:`package main

import "fmt"

func swap(x, y *int) {
	*x, *y = *y, *x
}

func addTo(p *int, d int) {
	*p += d
}

func main() {
	var a, b int
	fmt.Scan(&a, &b)
	swap(&a, &b)
	addTo(&a, 10)
	fmt.Println(a, b)
}`,
  hint:'Внутри функций работай с <code>*x</code> и <code>*y</code>: обмен записывается как <code>*x, *y = *y, *x</code>, а прибавление как <code>*p += d</code>.'},
 l:[
  ['trainer','A Tour of Go: Pointers','https://go.dev/tour/moretypes/1','en'],
  ['art','Go by Example: Pointers','https://gobyexample.com/pointers','en'],
  ['doc','Спецификация: типы-указатели','https://go.dev/ref/spec#Pointer_types','en'],
  ['doc','Go FAQ: методы на значениях и указателях','https://go.dev/doc/faq#methods_on_values_or_pointers','en']]},
"s1-23":{b:[
 ['def',`<b><code>nil</code></b> это предопределённый идентификатор Go, который означает <b>нулевое значение</b> для шести видов типов: указателей, срезов, мап, каналов, функций и интерфейсов. Это не «пустота вообще», а значение, у которого у каждого типа своё поведение: nil-срез можно безопасно мерить и дополнять через <code>append</code>, из nil-мапы можно читать, а записывать нельзя (паника), nil-указатель нельзя разыменовывать. Встроенная функция <b><code>new(T)</code></b> выделяет память под нулевое значение типа <code>T</code> и возвращает <b>указатель</b> <code>*T</code> на него. Она отличается от <code>make</code>, которая создаёт и инициализирует только срезы, мапы и каналы и возвращает сам тип, а не указатель. <code>new</code> в реальном коде используют редко: чаще пишут <code>&amp;T{...}</code>.`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	var p *int
	var s []int
	var m map[string]int
	var f func()
	var e error
	fmt.Println(p == nil, s == nil, m == nil, f == nil, e == nil)
	fmt.Println(len(s), len(m), m["x"])
}`,[
  ['6','Указатель без значения: нулевое значение это <code>nil</code>.'],
  ['7','Срез без значения: <code>nil</code>.'],
  ['8','Мапа без инициализации: <code>nil</code>.'],
  ['9','Переменная-функция без значения: <code>nil</code>.'],
  ['10','Интерфейс (<code>error</code> это интерфейс) без значения: <code>nil</code>. Так выглядит «нет ошибки».'],
  ['11','Все пять сравнений с <code>nil</code> дают <code>true</code>. Любую переменную этих видов можно проверить так.'],
  ['12','У nil-среза и nil-мапы длина 0, а чтение несуществующего ключа даёт нулевое значение типа (0). Паники нет.']]],
 ['out',`true true true true true
0 0 0`],
 ['h','Зачем это нужно'],
 ['p','<code>nil</code> встречается в каждой Go-программе: «нет ошибки» это <code>err == nil</code>, «значение не найдено» часто <code>nil</code>, «поле не задано» это <code>nil</code> указатель. Умение предсказать, что можно делать с <code>nil</code> значением (а что вызовет панику), отличает уверенного Go-разработчика. Паники из-за nil-мапы и nil-указателя это самый частый класс ошибок времени выполнения у новичков.'],
 ['real',5,'каждый день',[
  '<b>Проверка ошибок:</b> <code>if err != nil</code> повторяется сотни раз в проекте.',
  '<b>Необязательные значения:</b> <code>*string</code> со значением <code>nil</code> значит «поле не передано» (PATCH-запросы, JSON с <code>null</code>).',
  '<b>Инициализация структур:</b> <code>&amp;Server{}</code> вместо <code>new(Server)</code>, чтобы сразу задать поля.',
  '<b>Мапы и срезы:</b> <code>make(map...)</code> перед записью и безопасный <code>append</code> к nil-срезу.',
  '<b>Интерфейсы и каналы:</b> nil-интерфейс как «нет реализации», nil-канал как «отключённая ветка select».']],
 ['h','1. new и &T{}: выделение памяти'],
 ['p','<code>new(T)</code> возвращает указатель на нулевое значение. Для структур то же самое часто пишут как <code>&amp;T{}</code> и сразу подставляют поля: это стандарт на практике.'],
 ['lines',`package main

import "fmt"

type Config struct {
	Port  int
	Debug bool
}

func main() {
	p := new(int)
	fmt.Println(*p)
	*p = 7
	fmt.Println(*p)
	c := new(Config)
	c.Port = 8080
	fmt.Printf("%+v\\n", *c)
	c2 := &Config{Port: 9090}
	fmt.Printf("%+v\\n", *c2)
}`,[
  ['5–8','Структура настроек с двумя полями.'],
  ['11','<code>new(int)</code> выделяет память под <code>int</code>, кладёт туда 0 и возвращает <code>*int</code>.'],
  ['12','Читаем значение по указателю: 0.'],
  ['13–14','Записываем через указатель и читаем снова.'],
  ['15','<code>new(Config)</code> даёт <code>*Config</code> с нулевыми полями (0 и false).'],
  ['16','Поля структуры по указателю доступны через точку.'],
  ['17','<code>*c</code> разыменовывает и печатает структуру с именами полей.'],
  ['18','<code>&amp;Config{Port: 9090}</code> делает то же, но сразу с нужными значениями. Именно такой вариант вы будете видеть чаще.'],
  ['19','Печатаем вторую структуру.']]],
 ['out',`0
7
{Port:8080 Debug:false}
{Port:9090 Debug:false}`],
 ['h','2. Срезы и мапы: nil безопасен не везде'],
 ['p','Nil-срез ведёт себя как пустой: у него есть длина 0, по нему можно ходить циклом, к нему можно делать <code>append</code>. Nil-мапа позволяет только читать. Любая запись это паника, поэтому мапу создают через <code>make</code> или литерал.'],
 ['lines',`package main

import "fmt"

func main() {
	var s []int
	s = append(s, 1, 2)
	fmt.Println(s, len(s), s == nil)

	m := make(map[string]int)
	m["a"] = 1
	fmt.Println(m)
}`,[
  ['6','Nil-срез, как будто ничего не создавали.'],
  ['7','<code>append</code> сам создаёт массив под элементы и возвращает новый срез. Присваиваем результат обратно.'],
  ['8','Теперь срез не nil и в нём два элемента.'],
  ['10','<code>make(map[string]int)</code> создаёт готовую к записи мапу.'],
  ['11','Запись работает.'],
  ['12','Печатаем мапу.']]],
 ['out',`[1 2] 2 false
map[a:1]`],
 ['code',`package main

import "fmt"

func main() {
	var m map[string]int
	fmt.Println(m["a"])
	m["a"] = 1
}`],
 ['out',`0
panic: assignment to entry in nil map
…`],
 ['p','Чтение из nil-мапы вернуло 0, а запись вызвала панику <code>assignment to entry in nil map</code>. Дальше в реальном выводе идёт трассировка стека (здесь обрезана).'],
 ['h','3. Ловушка: nil внутри интерфейса'],
 ['p','Интерфейс состоит из двух частей: <b>типа</b> и <b>значения</b>. Интерфейс равен <code>nil</code>, только когда пусты обе части. Если положить в интерфейс nil-указатель, тип в нём уже есть, и сравнение с <code>nil</code> даст <code>false</code>. Классический баг при возврате <code>error</code>.'],
 ['lines',`package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "my error" }

func find() error {
	var e *MyErr = nil
	return e
}

func main() {
	err := find()
	fmt.Println(err == nil)
	fmt.Printf("%T\\n", err)
}`,[
  ['5','Свой тип ошибки.'],
  ['7','Метод <code>Error</code> на указателе делает <code>*MyErr</code> реализацией интерфейса <code>error</code>.'],
  ['9–12','Функция «ничего не нашла» и вернула nil-указатель конкретного типа.'],
  ['15','Вызываем функцию: ждём «ошибки нет», но...'],
  ['16','...в интерфейсе <code>error</code> лежит пара (тип <code>*MyErr</code>, значение nil), поэтому он не равен <code>nil</code>: <code>false</code>.'],
  ['17','<code>%T</code> показывает, что внутри тип <code>*main.MyErr</code>. Исправление: возвращать явный <code>nil</code>, а не переменную конкретного типа.']]],
 ['out',`false
*main.MyErr`],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>assignment to entry in nil map</code>','Записали в мапу без <code>make</code>. Создай мапу: <code>m := make(map[K]V)</code> или литерал.'],
  ['<code>nil pointer dereference</code>','Обратились к полю или значению через nil-указатель. Проверь <code>p != nil</code>.'],
  ['<code>err != nil</code> почему-то <code>true</code>, хотя ошибки нет','В <code>error</code> лежит nil-указатель конкретного типа. Возвращай литеральный <code>nil</code>.'],
  ['<code>new(map[string]int)</code> не помогает записывать','<code>new</code> даёт указатель на nil-мапу. Для мап, срезов и каналов нужен <code>make</code>.'],
  ['Вызов nil-функции','Поле-функция не задано. Проверяй <code>if f != nil</code> перед вызовом.'],
  ['Сравнение <code>s == nil</code> для «пустоты» среза','Пустой срез <code>[]int{}</code> не равен <code>nil</code>. Для проверки пустоты используй <code>len(s) == 0</code>.']]],
 ['warn','<code>nil</code> не является ключевым словом и не равен нулю: это значение, тип которого определяется контекстом. Нельзя написать <code>x := nil</code>, компилятор не знает тип: «use of untyped nil in variable declaration».'],
 ['case','PATCH-запрос и необязательные поля',[
  '<p>Клиент присылает частичное обновление пользователя: только имя, только возраст или ничего. Если поля обычные (<code>int</code>), нельзя отличить «возраст не прислали» от «возраст 0». Поэтому в таких структурах поля делают указателями: <code>nil</code> значит «не передано», а указатель на 0 значит «передан ноль».</p>'].join('')],
 ['lines',`package main

import "fmt"

type Patch struct {
	Name *string
	Age  *int
}

func apply(p Patch) {
	if p.Name != nil {
		fmt.Println("новое имя:", *p.Name)
	}
	if p.Age != nil {
		fmt.Println("новый возраст:", *p.Age)
	}
}

func main() {
	name := "Анна"
	zero := 0
	apply(Patch{Name: &name})
	apply(Patch{Age: &zero})
	apply(Patch{})
}`,[
  ['5–8','Поля-указатели позволяют выразить «значения нет».'],
  ['10','Функция применяет только те поля, которые заданы.'],
  ['11–13','Если имя передали, печатаем (разыменовав указатель).'],
  ['14–16','То же для возраста. Передали указатель на 0: возраст 0 тоже печатается, это не «отсутствует».'],
  ['20–21','Две переменные, адреса которых передадим.'],
  ['22–24','Три запроса: только имя, только возраст 0, ничего (не напечатается ничего).']]],
 ['out',`новое имя: Анна
новый возраст: 0`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Для каких типов существует nil?</b> Указатели, срезы, мапы, каналы, функции, интерфейсы.',
  '<b>Чем <code>new</code> отличается от <code>make</code>?</b> <code>new(T)</code> возвращает <code>*T</code> на нулевое значение для любого типа; <code>make</code> только для срезов, мап и каналов и возвращает сам тип, инициализированным.',
  '<b>Можно ли писать в nil-мапу? А в nil-срез через append?</b> В мапу нельзя (паника), <code>append</code> к nil-срезу работает.',
  '<b>Почему интерфейс с nil-указателем внутри не равен nil?</b> У интерфейса есть динамический тип; он равен nil, только когда пусты и тип, и значение.',
  '<b>Чем <code>&amp;T{}</code> лучше <code>new(T)</code>?</b> Можно сразу задать поля; по сути оба выделяют и возвращают указатель.']],
 ['src',[
  ['Спецификация: Predeclared identifiers (nil)','https://go.dev/ref/spec#Predeclared_identifiers','Что такое nil','en'],
  ['Спецификация: Allocation (new)','https://go.dev/ref/spec#Allocation','Формальное описание new','en'],
  ['Effective Go: Allocation with new и make','https://go.dev/doc/effective_go#allocation_new','Когда new, когда make','en'],
  ['Go FAQ: почему nil-ошибка не равна nil','https://go.dev/doc/faq#nil_error','Разбор ловушки с интерфейсами','en'],
  ['Go by Example: Maps','https://gobyexample.com/maps','Работа с мапами и make','en']]]
 ],
 q:[
  ['Для каких типов в Go есть <code>nil</code>?','Указатели, срезы, мапы, каналы, функции, интерфейсы.'],
  ['Чем <code>new(T)</code> отличается от <code>make</code>?','<code>new</code> возвращает <code>*T</code> на нулевое значение для любого типа, <code>make</code> только для срезов, мап и каналов и возвращает сам тип.'],
  ['Что будет при записи в nil-мапу?','Паника <code>assignment to entry in nil map</code>. Мапу нужно создать через <code>make</code>.'],
  ['Работает ли <code>append</code> для nil-среза?','Да, создаёт новый массив и возвращает срез.'],
  ['Почему <code>err != nil</code> иногда <code>true</code> без ошибки?','В интерфейс положили nil-указатель конкретного типа: тип в интерфейсе не nil.'],
  ['Зачем в структурах поля-указатели вроде <code>*int</code>?','Чтобы отличить «значения нет» (<code>nil</code>) от нулевого значения.']],
 quiz:[
  ['Что напечатает <code>var s []int; fmt.Println(len(s), s == nil)</code>?',['0 true','0 false','nil true','паника'],0,'Нулевой срез это nil, длина у него 0.'],
  ['Что произойдёт: <code>var m map[string]int; m["a"] = 1</code>?',['записало','компиляторная ошибка','паника','записало 0'],2,'Запись в nil-мапу это паника времени выполнения.'],
  ['Что вернёт <code>new(int)</code>?',['0','*int, указывающий на 0','nil','int'],1,'<code>new</code> всегда возвращает указатель на нулевое значение.'],
  ['Какой вызов подходит для создания пустой мапы, готовой к записи?',['new(map[string]int)','make(map[string]int)','map[string]int(nil)','var m map[string]int'],1,'<code>make</code> инициализирует мапу.'],
  ['Почему <code>find() == nil</code> может быть false, хотя функция вернула nil-указатель как error?',['баг компилятора','интерфейс хранит тип','nil всегда не равен nil','указатель не пуст'],1,'Интерфейс равен nil, только если и тип, и значение пустые.'],
  ['Какой срез равен nil?',['[]int{}','make([]int, 0)','var s []int','[]int{0}'],2,'Только объявленный без значения. Остальные уже созданы и не nil.']],
 task:{
  text:'<p>Первая строка: число <code>n</code> (количество записей). Дальше <code>n</code> строк вида <code>имя очки</code> (имя без пробелов, очки целое). Последняя строка: имя для поиска. Напиши функцию <code>find(m map[string]int, key string) *int</code>, которая возвращает <b>указатель</b> на очки или <code>nil</code>, если имени нет. Если нашли, выведи очки, иначе выведи <code>not found</code>.</p><p>Пример ввода:</p><pre>3\nanna 5\nbob 7\nclara 9\nbob</pre><p>Пример вывода: <code>7</code></p><p>Очки 0 тоже считаются «найдено» (выведи 0).</p>',
  starter:`package main

import "fmt"

// TODO: верни указатель на значение или nil, если ключа нет
func find(m map[string]int, key string) *int {
	return nil
}

func main() {
	var n int
	fmt.Scan(&n)
	m := make(map[string]int)
	for i := 0; i < n; i++ {
		var name string
		var score int
		fmt.Scan(&name, &score)
		m[name] = score
	}
	var query string
	fmt.Scan(&query)

	// TODO: вызови find; если результат nil, выведи "not found", иначе значение
	fmt.Println(find(m, query))
}`,
  checks:[{in:'3\nanna 5\nbob 7\nclara 9\nbob\n',out:'7'},{in:'2\nanna 5\nbob 7\ndan\n',out:'not found'},{in:'0\nanna\n',out:'not found'},{in:'1\nzero 0\nzero\n',out:'0'}],
  solution:`package main

import "fmt"

func find(m map[string]int, key string) *int {
	v, ok := m[key]
	if !ok {
		return nil
	}
	return &v
}

func main() {
	var n int
	fmt.Scan(&n)
	m := make(map[string]int)
	for i := 0; i < n; i++ {
		var name string
		var score int
		fmt.Scan(&name, &score)
		m[name] = score
	}
	var query string
	fmt.Scan(&query)
	p := find(m, query)
	if p == nil {
		fmt.Println("not found")
	} else {
		fmt.Println(*p)
	}
}`,
  hint:'В <code>find</code> используй <code>v, ok := m[key]</code>: при <code>!ok</code> верни <code>nil</code>, иначе <code>&amp;v</code>. В <code>main</code> проверяй <code>p == nil</code>.'},
 l:[
  ['doc','Спецификация: nil и предопределённые идентификаторы','https://go.dev/ref/spec#Predeclared_identifiers','en'],
  ['doc','Effective Go: new и make','https://go.dev/doc/effective_go#allocation_new','en'],
  ['art','Go FAQ: почему nil-ошибка не равна nil','https://go.dev/doc/faq#nil_error','en'],
  ['art','Go by Example: Maps','https://gobyexample.com/maps','en']]},

"s1-24":{b:[
 ['def',`<b>Ввод данных от пользователя</b> в Go это чтение байтов из <b>стандартного потока ввода</b> <code>os.Stdin</code> (значение типа <code>*os.File</code>, реализующее интерфейс <code>io.Reader</code>) и превращение их в значения программы. Есть два уровня. Первый: функции форматированного ввода пакета <code>fmt</code> (<code>Scan</code>, <code>Scanln</code>, <code>Scanf</code>), которые сразу разбирают слова в переменные по указателям. Второй: пакет <code>bufio</code> с типами <code>Scanner</code> (читает строки или слова) и <code>Reader</code> (читает до разделителя, например <code>ReadString('\\n')</code>), который лучше подходит для строк с пробелами и для больших объёмов. Любое чтение возвращает ошибку: <code>io.EOF</code> означает «ввод закончился», и это нормальное завершение, а не авария. Весь ввод по сути текст, поэтому числа из него разбирают через <code>strconv</code> или сразу <code>fmt.Scan</code> в переменную нужного типа.`],
 ['h','Пример'],
 ['p','Чтобы пример можно было запустить без клавиатуры, вместо <code>os.Stdin</code> подставлена строка через <code>strings.NewReader</code>: для программы это тоже <code>io.Reader</code>. Для настоящего ввода замени первый аргумент <code>Fscan</code> на <code>os.Stdin</code> или пиши <code>fmt.Scan(&amp;name, &amp;age)</code> без первого аргумента.'],
 ['lines',`package main

import (
	"fmt"
	"strings"
)

func main() {
	in := strings.NewReader("Анна 25 4.5")
	var name string
	var age int
	var score float64
	n, err := fmt.Fscan(in, &name, &age, &score)
	fmt.Println(n, err)
	fmt.Println(name, age, score)
}`,[
  ['9','Источник данных: строка вместо клавиатуры. В настоящей программе здесь был бы <code>os.Stdin</code>.'],
  ['10–12','Три переменные нужных типов: <code>fmt</code> по типу переменной поймёт, как разбирать слово.'],
  ['13','<code>Fscan</code> читает слова, разделённые пробелами и переводами строк, и записывает их по указателям. Возвращает число успешно прочитанных значений и ошибку. Для клавиатуры: <code>fmt.Scan(&amp;name, &amp;age, &amp;score)</code>.'],
  ['14','Прочитано 3 значения, ошибки нет.'],
  ['15','Строка осталась строкой, «25» стало целым, «4.5» дробным.']]],
 ['out',`3 <nil>
Анна 25 4.5`],
 ['h','Зачем это нужно'],
 ['p','В учебных задачах, олимпиадах и консольных утилитах ввод с клавиатуры это основной способ получить данные. В боевом бэкенде пользователь «вводит» данные не с клавиатуры, а через HTTP-запрос, но принципы те же: данные приходят текстом, могут быть неполными или неверными, а чтение возвращает ошибку. Стандартный ввод также используют для конвейеров (<code>cat file | ./app</code>) и интерактивных CLI. Знакомство с <code>bufio.Scanner</code> пригодится и для чтения файлов, и для чтения тела запроса построчно.'],
 ['real',3,'иногда',[
  '<b>CLI-утилиты:</b> чтение команд и подтверждений («Удалить? y/n»).',
  '<b>Конвейеры:</b> обработка данных, поданных через pipe, построчно через <code>bufio.Scanner</code>.',
  '<b>Скрипты и миграции:</b> разбор больших файлов и логов построчно.',
  '<b>Тестовые задачи и собеседования:</b> почти везде требуется читать ввод и печатать результат.',
  '<b>Прототипы:</b> быстрая проверка идеи с интерактивным вводом.']],
 ['h','1. Построчное чтение: bufio.Scanner'],
 ['p','<code>Scanner</code> по умолчанию режет поток на <b>строки</b> (без символа перевода строки). Цикл <code>for sc.Scan()</code> работает, пока есть данные; после цикла нужно проверить <code>sc.Err()</code>. Это самый распространённый способ читать ввод: он понимает пробелы внутри строки и корректно обрабатывает конец файла.'],
 ['lines',`package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	input := "первая строка\\nвторая со словами\\n\\nчетвёртая"
	sc := bufio.NewScanner(strings.NewReader(input))
	n := 0
	for sc.Scan() {
		n++
		fmt.Printf("%d: %q\\n", n, sc.Text())
	}
	if err := sc.Err(); err != nil {
		fmt.Println("ошибка чтения:", err)
	}
	fmt.Println("строк:", n)
}`,[
  ['10','Четыре строки; третья пустая. Для клавиатуры вместо <code>strings.NewReader(input)</code> пишут <code>os.Stdin</code>.'],
  ['11','Создаём сканер. Режим по умолчанию: одна строка за раз.'],
  ['12','Счётчик строк.'],
  ['13','<code>Scan()</code> возвращает <code>true</code>, пока удалось прочитать очередную строку; на конце ввода вернёт <code>false</code>.'],
  ['14','Считаем строку.'],
  ['15','<code>Text()</code> возвращает текущую строку уже без <code>\\n</code>. Пустая строка тоже приходит (это третья).'],
  ['17–19','После цикла проверяем настоящую ошибку: конец ввода ошибкой не считается, а, например, слишком длинная строка считается.'],
  ['20','Итог: 4 строки, включая пустую.']]],
 ['out',`1: "первая строка"
2: "вторая со словами"
3: ""
4: "четвёртая"
строк: 4`],
 ['h','2. По словам и числа из ввода'],
 ['p','Если разделитель не строки, а любые пробельные символы, подключают <code>sc.Split(bufio.ScanWords)</code>. Тогда <code>Text()</code> выдаёт по одному слову, а числа разбираются через <code>strconv.Atoi</code> с проверкой ошибки.'],
 ['lines',`package main

import (
	"bufio"
	"fmt"
	"strconv"
	"strings"
)

func main() {
	sc := bufio.NewScanner(strings.NewReader("10 20  30\\nabc 40"))
	sc.Split(bufio.ScanWords)
	sum, bad := 0, 0
	for sc.Scan() {
		v, err := strconv.Atoi(sc.Text())
		if err != nil {
			bad++
			continue
		}
		sum += v
	}
	fmt.Println(sum, bad)
}`,[
  ['11','Ввод с лишними пробелами и переносом строки внутри.'],
  ['12','Переключаем режим: теперь сканер выдаёт слова, перенос строки считается пробелом.'],
  ['13','Накопители суммы и числа неверных слов.'],
  ['14','Читаем слово за словом.'],
  ['15','Каждое слово пробуем превратить в число.'],
  ['16–19','Не число (например, «abc»): считаем как мусор и идём дальше.'],
  ['20','Складываем корректные числа.'],
  ['22','Сумма 100 (10+20+30+40) и одно неверное слово.']]],
 ['out',`100 1`],
 ['h','3. bufio.Reader: ReadString и конец ввода'],
 ['p',`<code>ReadString('\\n')</code> читает всё до разделителя <b>включая</b> его. Если данные закончились раньше разделителя, вернёт накопленный остаток и ошибку <code>io.EOF</code>: этот последний кусок нельзя терять.`],
 ['lines',`package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	r := bufio.NewReader(strings.NewReader("one\\ntwo\\nlast"))
	for {
		line, err := r.ReadString('\\n')
		fmt.Printf("%q %v\\n", line, err)
		if err != nil {
			break
		}
	}
}`,[
  ['10','Три строки, последняя без завершающего перевода строки.'],
  ['11','Бесконечный цикл с выходом по ошибке.'],
  ['12','Читаем до <code>\\n</code>. Символ перевода строки остаётся в строке.'],
  ['13','Печатаем строку в кавычках (видно <code>\\n</code>) и ошибку.'],
  ['14–16','На любой ошибке выходим. Для двух первых строк ошибка <code>nil</code>, на третьей <code>EOF</code>, но строка <code>"last"</code> уже прочитана: её надо обработать до выхода.']]],
 ['out',`"one/n" <nil>
"two/n" <nil>
"last" EOF`],
 ['h','4. Ловушка: Scan читает слова, а не строки'],
 ['code',`package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	in := strings.NewReader("Иван Петров\\n")
	var first string
	fmt.Fscan(in, &first)
	rest, _ := bufio.NewReader(in).ReadString('\\n')
	fmt.Printf("%q %q\\n", first, rest)
}`],
 ['out',`"Иван" " Петров/n"`],
 ['p','<code>Scan</code> взял только первое слово «Иван», остальное осталось в потоке. Чтобы прочитать «Иван Петров» целиком, используй <code>bufio.Scanner</code> или <code>Reader.ReadString</code>.'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>fmt.Scan(&amp;name)</code> прочитал только одно слово','<code>Scan</code> разделяет по пробелам. Для строки с пробелами используй <code>bufio.Scanner</code>.'],
  ['Забыли <code>&amp;</code>: <code>fmt.Scan(name)</code>','Нужен указатель, чтобы <code>Scan</code> записал значение. <code>go vet</code> предупредит.'],
  ['Scan вернул <code>EOF</code>, а переменные пустые','Ввод закончился или пуст. Всегда проверяй <code>n, err</code>.'],
  ['<code>bufio.Scanner</code>: <code>token too long</code>','Строка длиннее 64 КБ. Увеличь буфер: <code>sc.Buffer(make([]byte, 1024*1024), 1024*1024)</code>.'],
  ['В конце строки лишний <code>\\r</code> на Windows','Перевод строки может быть <code>\\r\\n</code>. <code>Scanner</code> по умолчанию его убирает, а <code>ReadString</code> нет: подстрахуйся <code>strings.TrimSpace</code>.'],
  ['После <code>Scan</code> вызвали <code>ReadString</code> и получили пустую строку','В потоке остался перевод строки после числа. Смешивать два способа чтения нельзя.']]],
 ['warn','Не смешивай <code>fmt.Scan</code> и <code>bufio.Reader</code> на одном <code>os.Stdin</code>: <code>bufio</code> забирает данные с запасом, и <code>fmt</code> может не увидеть часть ввода. Выбери один способ на всю программу.'],
 ['case','Чтение числа с подтверждением',[
  '<p>Утилита очистки базы спрашивает: «Удалить 1500 записей? (yes/no)». Любой ответ, кроме точного <code>yes</code>, должен отменять операцию. Читаем строку целиком, обрезаем пробелы и переводим в нижний регистр. Так случайный пустой Enter или «Yes » не приведёт к необратимому действию (мы выбираем безопасное по умолчанию).</p>',].join('')],
 ['code',`reader := bufio.NewReader(os.Stdin)
fmt.Print("Удалить записи? (yes/no): ")
answer, _ := reader.ReadString('\\n')
if strings.ToLower(strings.TrimSpace(answer)) != "yes" {
    fmt.Println("отменено")
    return
}`],
 ['h','Вопросы с собеседований'],
 ['ul',[
  `<b>Как прочитать строку с пробелами?</b> <code>bufio.Scanner</code> (<code>Scan</code> + <code>Text</code>) или <code>bufio.Reader.ReadString('\\n')</code>. Не <code>fmt.Scan</code>.`,
  '<b>Чем <code>Scan</code> отличается от <code>Scanln</code>?</b> <code>Scan</code> считает переводы строк пробелами, <code>Scanln</code> останавливается на конце строки.',
  '<b>Что такое <code>io.EOF</code>?</b> Сигнал «данные закончились». Это нормальное завершение чтения, а не сбой.',
  '<b>Какой лимит строки у <code>bufio.Scanner</code> и как его изменить?</b> 64 КБ по умолчанию, меняется через <code>Buffer</code>.',
  '<b>Почему удобно принимать <code>io.Reader</code>, а не использовать <code>os.Stdin</code> напрямую?</b> Функцию легко тестировать: подставил <code>strings.NewReader</code>, и никакой клавиатуры не нужно.']],
 ['src',[
  ['Пакет bufio','https://pkg.go.dev/bufio','Scanner, Reader, Split-функции','en'],
  ['Пакет fmt: Scanning','https://pkg.go.dev/fmt#hdr-Scanning','Правила разбора Scan, Scanln, Scanf','en'],
  ['Пакет os (Stdin)','https://pkg.go.dev/os#pkg-variables','Стандартные потоки ввода и вывода','en'],
  ['Go by Example: Line Filters','https://gobyexample.com/line-filters','Построчная обработка stdin','en'],
  ['Пакет io (EOF и Reader)','https://pkg.go.dev/io','Интерфейс io.Reader и ошибка EOF','en']]]
 ],
 q:[
  ['Чем <code>fmt.Scan</code> отличается от <code>bufio.Scanner</code>?','<code>Scan</code> читает слова в переменные; <code>Scanner</code> читает строки (или слова) целиком и лучше для текста с пробелами.'],
  ['Что означает <code>io.EOF</code>?','Конец ввода: данных больше нет. Это нормально, не авария.'],
  ['Почему нужен <code>&amp;</code> в <code>fmt.Scan(&amp;x)</code>?','Функции нужен адрес переменной, чтобы записать в неё значение.'],
  ['Как прочитать строку «Иван Петров» целиком?','Через <code>bufio.Scanner</code> или <code>ReadString(\'\\n\')</code>.'],
  ['Как проверить ошибки <code>Scanner</code>?','После цикла: <code>if err := sc.Err(); err != nil</code>.'],
  ['Как увеличить лимит строки сканера?','<code>sc.Buffer(buf, max)</code>, по умолчанию лимит 64 КБ.']],
 quiz:[
  ['Что прочитает <code>fmt.Scan(&amp;s)</code> из ввода «Иван Петров»?',['Иван Петров','Иван','Петров','ошибку'],1,'<code>Scan</code> делит по пробелам и читает одно слово на переменную.'],
  ['Какая функция подходит, чтобы прочитать всю строку с пробелами?',['fmt.Scan','bufio.Scanner','strconv.Atoi','os.Args'],1,'<code>Scanner</code> по умолчанию читает по строке.'],
  ['Что вернёт <code>sc.Scan()</code> в конце ввода?',['true','false','панику','nil'],1,'<code>false</code> завершает цикл, ошибку смотрят через <code>sc.Err()</code>.'],
  ['Что вернёт <code>ReadString(\'\\n\')</code>, если последняя строка без перевода строки?',['только ошибку','остаток и EOF','панику','пустую строку без ошибки'],1,'Остаток возвращается вместе с <code>io.EOF</code>, его нельзя выбрасывать.'],
  ['Что делает <code>sc.Split(bufio.ScanWords)</code>?',['читает по символам','читает по словам','читает по строкам','отключает буфер'],1,'Меняет режим разделения на слова.'],
  ['Зачем в функциях принимать <code>io.Reader</code>?',['быстрее работает','можно тестировать без клавиатуры','обязательное требование Go','меньше памяти'],1,'Подставляется любой источник: строка, файл, сеть.']],
 task:{
  text:'<p>Читай ввод до конца (до <code>EOF</code>) построчно. Выведи две строки: <code>lines=</code> и количество <b>непустых</b> строк (строка из одних пробелов считается пустой), затем <code>words=</code> и общее количество слов во всех строках.</p><p>Пример ввода:</p><pre>hello world\n\nfoo bar baz</pre><p>Пример вывода:</p><pre>lines=2\nwords=5</pre><p>Если ввод пуст, выведи <code>lines=0</code> и <code>words=0</code>.</p>',
  starter:`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	sc := bufio.NewScanner(os.Stdin)
	lines, words := 0, 0
	for sc.Scan() {
		line := sc.Text()
		// TODO: пропусти пустые строки (strings.TrimSpace)
		// TODO: увеличь lines и добавь количество слов (strings.Fields)
		_ = strings.Fields(line)
	}
	fmt.Println("lines=" + fmt.Sprint(lines))
	fmt.Println("words=" + fmt.Sprint(words))
}`,
  checks:[{in:'hello world\n\nfoo bar baz\n',out:'lines=2\nwords=5'},{in:'',out:'lines=0\nwords=0'},{in:'   \n\n  a  \n',out:'lines=1\nwords=1'},{in:'one\ntwo\nthree',out:'lines=3\nwords=3'}],
  solution:`package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	sc := bufio.NewScanner(os.Stdin)
	lines, words := 0, 0
	for sc.Scan() {
		f := strings.Fields(sc.Text())
		if len(f) == 0 {
			continue
		}
		lines++
		words += len(f)
	}
	fmt.Println("lines=" + fmt.Sprint(lines))
	fmt.Println("words=" + fmt.Sprint(words))
}`,
  hint:'<code>strings.Fields(line)</code> вернёт слова; если срез пустой, строка пустая. Иначе <code>lines++</code> и <code>words += len(...)</code>.'},
 l:[
  ['doc','Пакет bufio','https://pkg.go.dev/bufio','en'],
  ['doc','fmt: Scanning','https://pkg.go.dev/fmt#hdr-Scanning','en'],
  ['art','Go by Example: Line Filters','https://gobyexample.com/line-filters','en'],
  ['doc','Пакет io','https://pkg.go.dev/io','en']]},
"s1-25":{b:[
 ['def',`<b><code>any</code></b> это предопределённый псевдоним (alias) для <b>пустого интерфейса</b> <code>interface{}</code>, введённый в Go 1.18: <code>type any = interface{}</code>. Интерфейс в Go это набор методов, а у пустого интерфейса методов нет, поэтому ему удовлетворяет <b>любое</b> значение любого типа. Переменная типа <code>any</code> хранит пару: <b>динамический тип</b> и значение этого типа. Компилятор не знает, что внутри, поэтому проверки типов переносятся на этап выполнения: достать значение можно через <b>утверждение типа</b> (<code>v.(T)</code>) или <b>переключатель типов</b> (<code>switch v.(type)</code>). Это самый гибкий и самый «небезопасный» тип: он отключает контроль типов на этапе компиляции, поэтому им пользуются точечно, там где форма данных заранее неизвестна (JSON, аргументы <code>fmt.Println</code>). <code>any</code> и <code>interface{}</code> полностью взаимозаменяемы, а новый код принято писать с <code>any</code>.`],
 ['h','Пример'],
 ['lines',`package main

import "fmt"

func main() {
	var x any
	x = 42
	fmt.Println(x)
	x = "строка"
	fmt.Println(x)
	x = []int{1, 2}
	fmt.Println(x)
	fmt.Printf("%T\\n", x)
}`,[
  ['6','Объявляем переменную типа <code>any</code>. Пока в неё ничего не положили, она равна <code>nil</code>.'],
  ['7–8','Кладём число: теперь внутри динамический тип <code>int</code>.'],
  ['9–10','Та же переменная теперь хранит строку. В Go обычные переменные так не умеют, а <code>any</code> да.'],
  ['11–12','И срез целых.'],
  ['13','<code>%T</code> показывает динамический тип того, что лежит внутри сейчас: <code>[]int</code>.']]],
 ['out',`42
строка
[1 2]
[]int`],
 ['h','Зачем это нужно'],
 ['p','Ты уже пользуешься <code>any</code>, даже не замечая: сигнатура <code>fmt.Println(a ...any)</code> принимает значения любых типов именно поэтому. Для бэкенда главный случай это <b>данные неизвестной формы</b>: JSON, который разбирается в <code>map[string]any</code>, значения из базы, параметры в логах. В собственном коде <code>any</code> нужен реже: с появлением дженериков (<code>[T any]</code>) там, где раньше брали <code>interface{}</code>, лучше писать универсальные функции со строгими типами.'],
 ['real',4,'часто',[
  '<b>Стандартная библиотека:</b> <code>fmt.Println</code>, <code>Printf</code>, <code>log.Printf</code>, <code>errors.As</code> принимают <code>any</code>.',
  '<b>Неструктурированный JSON:</b> <code>var data map[string]any; json.Unmarshal(raw, &amp;data)</code>.',
  '<b>Контекст и метаданные:</b> <code>context.WithValue(ctx, key, value)</code> хранит значение как <code>any</code>.',
  '<b>Контейнеры общего вида:</b> коллекции и кэши «положить что угодно».',
  '<b>Дженерики:</b> ограничение <code>[T any]</code> означает «любой тип».']],
 ['h','1. Утверждение типа (type assertion)'],
 ['p','Запись <code>v.(T)</code> достаёт значение типа <code>T</code> из интерфейса. Форма с одним результатом при несовпадении типа <b>паникует</b>. Форма «comma ok» <code>n, ok := v.(T)</code> безопасна: при неудаче вернёт нулевое значение и <code>false</code>.'],
 ['lines',`package main

import "fmt"

func main() {
	var v any = "hello"
	s := v.(string)
	fmt.Println(s, len(s))
	n, ok := v.(int)
	fmt.Println(n, ok)
}`,[
  ['6','В <code>any</code> лежит строка.'],
  ['7','Утверждаем, что там строка. Совпало, получаем <code>string</code> со всеми его возможностями (например, <code>len</code>).'],
  ['8','Теперь с переменной <code>s</code> можно работать как с обычной строкой.'],
  ['9','Безопасная форма: спрашиваем, не <code>int</code> ли там. Это не так, паники нет.'],
  ['10','Значение <code>n</code> нулевое, <code>ok</code> равно <code>false</code>. Всегда используй comma-ok, когда не уверен в типе.']]],
 ['out',`hello 5
0 false`],
 ['code',`package main

import "fmt"

func main() {
	var v any = "hello"
	n := v.(int)
	fmt.Println(n)
}`],
 ['out',`panic: interface conversion: interface {} is string, not int
…`],
 ['p','Форма без <code>ok</code> при ошибке даёт панику <code>interface conversion</code> с понятным текстом: что лежало и что ждали (трассировка стека обрезана).'],
 ['h','2. Переключатель типов (type switch)'],
 ['p','Когда вариантов типа несколько, удобнее <code>switch v.(type)</code>. В каждой ветке переменная <code>t</code> имеет уже конкретный тип этой ветки, а ветка <code>default</code> ловит всё остальное.'],
 ['lines',`package main

import (
	"errors"
	"fmt"
)

func describe(v any) string {
	switch t := v.(type) {
	case nil:
		return "nil"
	case int:
		return fmt.Sprintf("целое %d", t)
	case string:
		return "строка " + t
	case []int:
		return fmt.Sprintf("срез из %d", len(t))
	case error:
		return "ошибка " + t.Error()
	default:
		return fmt.Sprintf("другое %T", t)
	}
}

func main() {
	items := []any{nil, 7, "go", []int{1, 2, 3}, errors.New("упс"), 3.5}
	for _, it := range items {
		fmt.Println(describe(it))
	}
}`,[
  ['8','Функция принимает что угодно и описывает словами.'],
  ['9','Особый синтаксис <code>v.(type)</code> работает только внутри <code>switch</code>. Результат сохраняем в <code>t</code>.'],
  ['10–11','Ветка <code>nil</code> ловит пустой интерфейс.'],
  ['12–13','Внутри ветки <code>int</code> переменная <code>t</code> это <code>int</code>, поэтому подходит для <code>%d</code>.'],
  ['14–15','В ветке <code>string</code> <code>t</code> строка, её можно склеивать.'],
  ['16–17','Можно проверять и составные типы, например срез.'],
  ['18–19','Ветка по <b>интерфейсу</b> <code>error</code> сработает для любого значения, у которого есть метод <code>Error()</code>.'],
  ['20–21','Всё остальное, здесь <code>float64</code>.'],
  ['26','Срез <code>[]any</code> может хранить значения разных типов одновременно.'],
  ['27–29','Печатаем описание каждого элемента.']]],
 ['out',`nil
целое 7
строка go
срез из 3
ошибка упс
другое float64`],
 ['h','3. Данные неизвестной формы: map[string]any'],
 ['lines',`package main

import (
	"fmt"
	"sort"
)

func main() {
	data := map[string]any{
		"name":  "Anna",
		"age":   30,
		"admin": true,
		"tags":  []string{"a", "b"},
	}
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	for _, k := range keys {
		fmt.Printf("%-6s %T %v\\n", k, data[k], data[k])
	}
}`,[
  ['9–14','Словарь со значениями разных типов: строка, число, булево, срез. Так выглядит разобранный JSON-объект.'],
  ['15','Заготавливаем срез под ключи.'],
  ['16–18','Собираем ключи.'],
  ['19','У мап в Go порядок обхода случайный, поэтому для стабильного вывода ключи сортируем.'],
  ['20–22','Для каждого ключа печатаем имя, динамический тип и значение. Видно, что <code>age</code> имеет тип <code>int</code>, а тип значений мапы <code>any</code> «стёрт» до ближайшего реального.']]],
 ['out',`admin  bool true
age    int 30
name   string Anna
tags   []string [a b]`],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>panic: interface conversion: interface {} is string, not int</code>','Утверждение типа без <code>ok</code> не совпало. Используй <code>v, ok := x.(T)</code> или type switch.'],
  ['Не получается сложить два значения <code>any</code>','Операции доступны только после превращения в конкретный тип: <code>a.(int) + b.(int)</code>.'],
  ['<code>var a, b any = 1, 1.0; a == b</code> даёт <code>false</code>','Интерфейсы равны, если равны динамический тип и значение; <code>int</code> и <code>float64</code> это разные типы.'],
  ['Сравнение двух <code>any</code> со срезами внутри паникует','Срезы не сравниваются через <code>==</code>. Для таких случаев используй <code>reflect.DeepEqual</code> или <code>slices.Equal</code>.'],
  ['Числа из JSON в <code>map[string]any</code> пришли как <code>float64</code>','Так <code>encoding/json</code> декодирует любые числа в <code>any</code>. Приводи: <code>int(v.(float64))</code>.'],
  ['Везде <code>any</code> «для универсальности»','Теряется проверка типов, больше паник. Используй конкретные типы, интерфейсы с методами или дженерики.']]],
 ['warn','Пустой интерфейс говорит «мне всё равно, что внутри», а хорошие интерфейсы Go описывают <b>поведение</b> (<code>io.Reader</code>, <code>fmt.Stringer</code>). Пословица Роба Пайка из Go Proverbs: «пустой интерфейс ничего не говорит». Если можешь, опиши, что именно тебе нужно от значения.'],
 ['case','Разбор JSON, форма которого заранее неизвестна',[
  '<p>Webhook от внешнего сервиса присылает JSON, поля которого меняются от события к событию. Для начала достаточно разобрать его в <code>map[string]any</code>, найти поле <code>type</code> и по нему решить, что делать дальше. Числа внутри придут как <code>float64</code>, вложенные объекты как <code>map[string]any</code>, массивы как <code>[]any</code>. Как только форма события стала известна, лучше завести под него структуру: код станет короче, безопаснее и быстрее.</p>'].join('')],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Что такое <code>any</code>?</b> Псевдоним <code>interface{}</code> (с Go 1.18): интерфейс без методов, которому удовлетворяет любой тип.',
  '<b>Как достать конкретное значение из <code>any</code>?</b> Утверждением типа <code>v.(T)</code> (лучше с <code>ok</code>) или <code>switch v.(type)</code>.',
  '<b>Что будет при неверном утверждении типа без <code>ok</code>?</b> Паника <code>interface conversion</code>.',
  '<b>Чем <code>any</code> отличается от дженерика <code>[T any]</code>?</b> <code>any</code> стирает тип и проверяет на этапе выполнения; дженерик сохраняет конкретный тип и проверяется при компиляции.',
  '<b>Когда интерфейс равен nil?</b> Когда не заданы ни динамический тип, ни значение.']],
 ['src',[
  ['A Tour of Go: Empty interface','https://go.dev/tour/methods/14','Пустой интерфейс','en'],
  ['A Tour of Go: Type assertions','https://go.dev/tour/methods/15','Утверждение типа','en'],
  ['A Tour of Go: Type switches','https://go.dev/tour/methods/16','Переключатель типов','en'],
  ['Спецификация: Type assertions','https://go.dev/ref/spec#Type_assertions','Формальные правила','en'],
  ['Go 1.18: any и дженерики','https://go.dev/blog/go1.18','Появление псевдонима any','en']]]
 ],
 q:[
  ['Что такое <code>any</code>?','Псевдоним <code>interface{}</code>: интерфейс без методов, подходит любой тип.'],
  ['Как достать значение из <code>any</code> безопасно?','<code>n, ok := v.(int)</code> или type switch.'],
  ['Что будет с <code>v.(int)</code>, если внутри строка?','Паника <code>interface conversion</code>.'],
  ['Чем type switch удобнее нескольких утверждений?','Одна конструкция с ветками по типам и сразу типизированной переменной в ветке.'],
  ['Почему числа из JSON в <code>any</code> имеют тип <code>float64</code>?','Так по умолчанию декодирует <code>encoding/json</code>.'],
  ['Почему лучше избегать лишнего <code>any</code>?','Теряется проверка типов: ошибки уходят из компиляции в рантайм.']],
 quiz:[
  ['Какой тип у переменной после <code>var x any = 3.5</code> при печати <code>%T</code>?',['any','interface{}','float64','int'],2,'<code>%T</code> показывает динамический тип значения внутри.'],
  ['Что вернёт <code>n, ok := v.(int)</code>, если в <code>v</code> лежит строка?',['паника','0 и false','"" и false','nil и true'],1,'Форма comma-ok не паникует: нулевое значение и <code>false</code>.'],
  ['Что произойдёт: <code>var v any = 5; s := v.(string)</code>?',['s будет "5"','s будет ""','паника','ошибка компиляции'],2,'Без <code>ok</code> неудачное утверждение типа паникует.'],
  ['Что даст <code>var a, b any = 1, 1.0; fmt.Println(a == b)</code>?',['true','false','паника','ошибка компиляции'],1,'Динамические типы разные (<code>int</code> и <code>float64</code>), значит, не равны.'],
  ['Где допустим синтаксис <code>v.(type)</code>?',['где угодно','только внутри switch','только в if','только в for'],1,'Это специальная форма, доступная лишь в переключателе типов.'],
  ['Что лучше выбрать для функции «максимум из двух значений любого числового типа»?',['any','дженерик с ограничением','interface{} с утверждениями','reflect'],1,'Дженерик сохраняет проверку типов при компиляции.']],
 task:{
  text:'<p>Первая строка: число <code>n</code>. Далее <code>n</code> слов через пробел (читай через <code>fmt.Scan</code>). Каждое слово разбери так: если это целое число, это <code>int</code>; иначе если дробное число (с точкой), это <code>float64</code>; иначе если слово точно <code>true</code> или <code>false</code>, это <code>bool</code>; иначе <code>string</code>. Положи значения в срез <code>[]any</code>, потом пройди по нему <code>switch v.(type)</code> и посчитай. Выведи две строки: <code>int=A float=B bool=C string=D</code> и <code>sum=S</code>, где S это сумма всех целых.</p><p>Пример ввода:</p><pre>7\n10 abc 3.5 true 7 false x</pre><p>Пример вывода:</p><pre>int=2 float=1 bool=2 string=2\nsum=17</pre>',
  starter:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)
	var items []any
	for i := 0; i < n; i++ {
		var w string
		fmt.Scan(&w)
		// TODO: определи тип слова и добавь в items значение нужного типа
		_ = strconv.Atoi
		items = append(items, w)
	}
	// TODO: пройди по items через type switch и посчитай
	fmt.Println(len(items))
}`,
  checks:[{in:'7\n10 abc 3.5 true 7 false x\n',out:'int=2 float=1 bool=2 string=2\nsum=17'},{in:'0\n',out:'int=0 float=0 bool=0 string=0\nsum=0'},{in:'3\n-5 2.25 hello\n',out:'int=1 float=1 bool=0 string=1\nsum=-5'},{in:'2\ntrue false\n',out:'int=0 float=0 bool=2 string=0\nsum=0'}],
  solution:`package main

import (
	"fmt"
	"strconv"
)

func main() {
	var n int
	fmt.Scan(&n)
	var items []any
	for i := 0; i < n; i++ {
		var w string
		fmt.Scan(&w)
		if v, err := strconv.Atoi(w); err == nil {
			items = append(items, v)
		} else if f, err := strconv.ParseFloat(w, 64); err == nil {
			items = append(items, f)
		} else if w == "true" || w == "false" {
			items = append(items, w == "true")
		} else {
			items = append(items, w)
		}
	}
	ints, floats, bools, strs, sum := 0, 0, 0, 0, 0
	for _, it := range items {
		switch v := it.(type) {
		case int:
			ints++
			sum += v
		case float64:
			floats++
		case bool:
			bools++
		case string:
			strs++
		}
	}
	fmt.Printf("int=%d float=%d bool=%d string=%d\\n", ints, floats, bools, strs)
	fmt.Printf("sum=%d\\n", sum)
}`,
  hint:'Для каждого слова пробуй по очереди <code>Atoi</code>, затем <code>ParseFloat</code>, затем сравнение с «true»/«false», иначе строка. Подсчёт делай в <code>switch v := it.(type)</code>.'},
 l:[
  ['trainer','A Tour of Go: Empty interface','https://go.dev/tour/methods/14','en'],
  ['trainer','A Tour of Go: Type assertions','https://go.dev/tour/methods/15','en'],
  ['trainer','A Tour of Go: Type switches','https://go.dev/tour/methods/16','en'],
  ['doc','Спецификация: Type assertions','https://go.dev/ref/spec#Type_assertions','en']]},
"s1-26":{b:[
 ['def',`<b>Числовые и прочие базовые типы</b> Go, кроме <code>bool</code>, <code>string</code> и <code>rune</code>, образуют целое семейство. <b>Целые со знаком</b>: <code>int8</code>, <code>int16</code>, <code>int32</code>, <code>int64</code> и платформо-зависимый <code>int</code> (32 или 64 бита, обычно 64). <b>Целые без знака</b>: <code>uint8</code> (он же <code>byte</code>), <code>uint16</code>, <code>uint32</code>, <code>uint64</code>, <code>uint</code>, а также <code>uintptr</code> для хранения адреса. <b>Дробные</b>: <code>float32</code> и <code>float64</code> (стандарт IEEE 754). <b>Комплексные</b>: <code>complex64</code> и <code>complex128</code>. Каждый тип имеет <b>точный размер и диапазон</b>, а смешивать разные типы в выражении нельзя: нужны явные преобразования. Поверх базовых можно объявлять <b>именованные типы</b> (<code>type Celsius float64</code>): это новые типы, не взаимозаменяемые с исходным. Значения без явного типа получают <b>тип по умолчанию</b>: <code>int</code>, <code>float64</code>, <code>complex128</code>, <code>rune</code>, <code>string</code>.`],
 ['h','Пример'],
 ['lines',`package main

import (
	"fmt"
	"math"
	"math/cmplx"
)

func main() {
	fmt.Printf("%T %T %T %T %T\\n", 1, 1.5, 1+2i, 'a', "s")
	fmt.Println(math.MinInt8, math.MaxInt8, math.MaxUint8)
	fmt.Println(math.MaxInt32, math.MaxInt64)
	z := 3 + 4i
	fmt.Println(real(z), imag(z), cmplx.Abs(z))
}`,[
  ['10','Типы по умолчанию: целый литерал это <code>int</code>, дробный <code>float64</code>, с «i» комплексный <code>complex128</code>, символ в одинарных кавычках <code>int32</code> (это <code>rune</code>), в двойных <code>string</code>.'],
  ['11','Константы пакета <code>math</code> показывают диапазоны: <code>int8</code> от -128 до 127, <code>uint8</code> до 255.'],
  ['12','Границы 32- и 64-битных целых.'],
  ['13','Комплексное число 3+4i (в бэкенде почти не встречается, но входит в язык).'],
  ['14','<code>real</code> и <code>imag</code> достают части, а <code>cmplx.Abs</code> считает модуль (египетский треугольник 3-4-5).']]],
 ['out',`int float64 complex128 int32 string
-128 127 255
2147483647 9223372036854775807
3 4 5`],
 ['h','Зачем это нужно'],
 ['p','Основной тип для целых это <code>int</code>, для дробных <code>float64</code>. Остальные нужны, когда важны <b>размер</b> и <b>формат</b>: <code>int64</code> для идентификаторов и временных меток, <code>uint8</code>/<code>byte</code> для сырых данных, <code>int32</code> и <code>uint32</code> в протоколах и форматах файлов, <code>float32</code> для больших массивов чисел с экономией памяти. Из-за точности <code>float</code> опасен для денег. Тонкие места: переполнение, деление и явные преобразования.'],
 ['real',4,'часто',[
  '<b>Идентификаторы и ключи:</b> <code>int64</code>/<code>uint64</code> для id из базы и временных меток Unix.',
  '<b>Байты:</b> <code>byte</code> и <code>[]byte</code> в сети, файлах, хэшах.',
  '<b>Доменные типы:</b> <code>type UserID int64</code>, <code>type Rub int64</code>, <code>time.Duration</code>: компилятор не даст перепутать.',
  '<b>Метрики и аналитика:</b> <code>float64</code> для процентов и средних значений.',
  '<b>Протоколы и форматы:</b> <code>uint16</code> порт, <code>uint32</code> размер, <code>int32</code> в Protobuf.']],
 ['h','1. Переполнение целых'],
 ['p','Целые типы имеют конечный диапазон. Если значение выходит за него во время работы программы, Go <b>молча заворачивает</b> результат (wrap-around), без ошибки и паники. Для констант, не помещающихся в тип, компилятор отказывается собирать программу.'],
 ['lines',`package main

import "fmt"

func main() {
	var u uint8 = 250
	for i := 0; i < 10; i++ {
		u++
	}
	fmt.Println(u)
	var s int8 = 127
	s++
	fmt.Println(s)
	var k uint
	k--
	fmt.Println(k)
}`,[
  ['6','<code>uint8</code> умеет хранить 0..255, сейчас 250.'],
  ['7–9','Десять раз прибавляем 1: после 255 счётчик «обнуляется» и идёт заново.'],
  ['10','Результат 4: 250 + 10 = 260, а 260 - 256 = 4.'],
  ['11–12','У <code>int8</code> максимум 127; следующее число становится минимальным -128.'],
  ['13','Печатаем -128.'],
  ['14–15','Беззнаковый ноль минус один превращается в максимум типа.'],
  ['16','На 64-битной системе это 18446744073709551615.']]],
 ['out',`4
-128
18446744073709551615`],
 ['code',`package main

import "fmt"

func main() {
	var x int8 = 200
	fmt.Println(x)
}`],
 ['out',`./main.go:6:15: cannot use 200 (untyped int constant) as int8 value in variable declaration (overflows)`],
 ['h','2. Арифметика и преобразования'],
 ['p','Деление целых отбрасывает дробную часть, а остаток от деления берёт знак делимого. Преобразование дробного в целое <b>обрезает</b> (к нулю), а не округляет. А у <code>float</code> ограничена точность: <code>0.1 + 0.2</code> не равно <code>0.3</code> (точно, если считать в переменных).'],
 ['lines',`package main

import "fmt"

func main() {
	a, b := 0.1, 0.2
	fmt.Println(a + b)
	fmt.Println(7/2, 7/2.0, -7/2, -7%3)
	x := 3.99
	fmt.Println(int(x), int(-x))
	f := 16777217
	fmt.Println(float32(f))
}`,[
  ['6','Две переменные <code>float64</code>. Константы <code>0.1 + 0.2</code> в коде считались бы точно, поэтому используем переменные.'],
  ['7','Печатается <code>0.30000000000000004</code>: двоичные дроби не умеют точно хранить 0.1. Поэтому сравнивают дробные числа с допуском, а деньги хранят целыми.'],
  ['8','<code>7/2</code> это 3 (целочисленное деление), <code>7/2.0</code> это 3.5, <code>-7/2</code> это -3 (к нулю), <code>-7%3</code> это -1.'],
  ['9–10','<code>int(3.99)</code> даёт 3, а <code>int(-3.99)</code> даёт -3: дробная часть отбрасывается.'],
  ['11–12','<code>float32</code> хранит около 7 значащих цифр: число 16777217 уже не помещается точно и превращается в 16777216.']]],
 ['out',`0.30000000000000004
3 3.5 -3 -1
3 -3
1.6777216e+07`],
 ['h','3. Именованные типы и псевдонимы'],
 ['p','Объявление <code>type Celsius float64</code> создаёт <b>новый тип</b> с тем же внутренним устройством, но с отдельной идентичностью: нельзя случайно сложить градусы Цельсия с Фаренгейтами. Для нового типа можно определять методы. Объявление <code>type A = int</code> создаёт лишь <b>псевдоним</b>: это буквально то же самое.'],
 ['lines',`package main

import "fmt"

type Celsius float64
type Fahrenheit float64

func CToF(c Celsius) Fahrenheit {
	return Fahrenheit(c*9/5 + 32)
}

func (c Celsius) String() string {
	return fmt.Sprintf("%.1f°C", float64(c))
}

func main() {
	c := Celsius(36.6)
	fmt.Println(c)
	fmt.Printf("%.2f\\n", CToF(c))
}`,[
  ['5–6','Два разных типа на основе <code>float64</code>. Для компилятора они не взаимозаменяемы.'],
  ['8–10','Функция принимает именно <code>Celsius</code>, возвращает <code>Fahrenheit</code>. Явное преобразование типа обязательно.'],
  ['12–14','Метод <code>String</code> у нового типа: теперь <code>fmt</code> печатает «36.6°C». На исходном <code>float64</code> методов не добавишь.'],
  ['17','Литерал приводим к типу <code>Celsius</code>.'],
  ['18','Печать через <code>String()</code>.'],
  ['19','Результат в Фаренгейтах с двумя знаками.']]],
 ['out',`36.6°C
97.88`],
 ['code',`package main

import "fmt"

type Celsius float64
type Fahrenheit float64

func main() {
	c := Celsius(10)
	f := Fahrenheit(50)
	fmt.Println(c + f)
}`],
 ['out',`./main.go:11:14: invalid operation: c + f (mismatched types Celsius and Fahrenheit)`],
 ['lines',`package main

import (
	"fmt"
	"time"
)

type MyInt int
type Alias = int

func main() {
	var x MyInt = 3
	var y Alias = 4
	var z int = y
	fmt.Printf("%T %T %T\\n", x, y, z)
	d := 90 * time.Minute
	fmt.Println(d, d.Hours())
}`,[
  ['8','Определение нового типа: <code>MyInt</code> теперь самостоятельный тип.'],
  ['9','Знак равенства делает <code>Alias</code> просто вторым именем для <code>int</code>.'],
  ['12','Переменная типа <code>MyInt</code>.'],
  ['13–14','Переменная псевдонима спокойно присваивается обычному <code>int</code>.'],
  ['15','<code>%T</code> показывает: <code>main.MyInt</code>, а у псевдонима просто <code>int</code>.'],
  ['16','<code>time.Duration</code> это именованный тип на базе <code>int64</code> (наносекунды), умножение на константу даёт 1,5 часа.'],
  ['17','Печать как «1h30m0s» и количество часов 1.5.']]],
 ['out',`main.MyInt int int
1h30m0s 1.5`],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>cannot use 200 (untyped int constant) as int8 value ... (overflows)</code>','Константа не помещается в тип. Выбери более широкий тип.'],
  ['<code>mismatched types int and int64</code>','Разные целые типы в одном выражении. Приведи явно: <code>int64(a) + b</code>.'],
  ['<code>mismatched types Celsius and Fahrenheit</code>','Именованные типы разные, и это задумано. Преобразуй явно, если действительно нужно.'],
  ['Счётчик «обнулился» без ошибки','Целочисленное переполнение в Go не паникует. Для проверки берите шире тип или проверяйте границы заранее (<code>math.MaxInt64 - a &lt; b</code>).'],
  ['<code>0.1 + 0.2 != 0.3</code>','Дробные числа неточны. Сравнивай через допуск (<code>math.Abs(a-b) &lt; 1e-9</code>), деньги держи в целых копейках.'],
  ['<code>int(x)</code> «округлил» вниз для 3.99','Преобразование обрезает дробную часть. Для округления есть <code>math.Round</code>.'],
  ['Делим целые и получаем 0: <code>1/2</code>','Целочисленное деление. Хотя бы один операнд нужно сделать <code>float64</code>.']]],
 ['warn','Не используй <code>float32</code>/<code>float64</code> для денег и точных количеств. Храни сумму в целых минимальных единицах (копейки в <code>int64</code>) или используй специализированную библиотеку десятичной арифметики.'],
 ['case','Деньги в копейках',[
  '<p>Интернет-магазин хранит цену как <code>int64</code> в копейках: 1999 означает 19,99 рубля. Суммы складываются без потери точности, скидка в процентах считается целочисленно (<code>price * 90 / 100</code>), а в строку «19.99» цена превращается только при показе пользователю. Заведи именованный тип <code>type Kopeck int64</code>, и компилятор не позволит случайно сложить цену с количеством товаров.</p>'].join('')],
 ['h','Вопросы с собеседований'],
 ['ul',[
  '<b>Какой размер у <code>int</code> в Go?</b> Зависит от платформы: 32 или 64 бита (на современных серверах 64).',
  '<b>Что такое <code>byte</code> и <code>rune</code>?</b> Псевдонимы <code>uint8</code> и <code>int32</code>.',
  '<b>Что будет при переполнении целого?</b> Значение заворачивается по модулю, без ошибки. Для констант ошибка компиляции.',
  '<b>Чем <code>type A int</code> отличается от <code>type A = int</code>?</b> Первое создаёт новый тип с отдельной идентичностью, второе просто псевдоним.',
  '<b>Почему нельзя хранить деньги в <code>float64</code>?</b> Двоичные дроби неточны: накапливаются ошибки округления. Хранят целые минимальные единицы.']],
 ['src',[
  ['Спецификация: числовые типы','https://go.dev/ref/spec#Numeric_types','Размеры и диапазоны','en'],
  ['Спецификация: определения типов и псевдонимы','https://go.dev/ref/spec#Type_declarations','Разница между type A B и type A = B','en'],
  ['Go Blog: Constants','https://go.dev/blog/constants','Как устроены типизированные и нетипизированные константы','en'],
  ['Пакет math','https://pkg.go.dev/math','MaxInt64, Round, Abs и другие','en'],
  ['Go by Example: Constants and Numbers','https://gobyexample.com/constants','Константы и числа','en']]]
 ],
 q:[
  ['Какие типы у литералов <code>1</code>, <code>1.5</code>, <code>1+2i</code>, <code>\'a\'</code>?','<code>int</code>, <code>float64</code>, <code>complex128</code>, <code>rune</code> (<code>int32</code>).'],
  ['Что произойдёт, если к <code>uint8</code> 255 прибавить 1?','Переполнение: результат 0, без ошибки и паники.'],
  ['Почему нельзя сложить <code>int</code> и <code>int64</code>?','Go не делает неявных преобразований. Нужно привести один из операндов.'],
  ['Чем <code>type A int</code> отличается от <code>type A = int</code>?','Первое новый тип, второе псевдоним.'],
  ['Почему <code>0.1 + 0.2 != 0.3</code>?','Двоичные <code>float</code> не могут точно хранить такие дроби.'],
  ['Как хранить деньги?','Целыми минимальными единицами (копейки в <code>int64</code>), а не <code>float</code>.']],
 quiz:[
  ['Что напечатает <code>var s int8 = 127; s++; fmt.Println(s)</code>?',['128','-128','0','паника'],1,'Переполнение заворачивает значение к минимуму типа.'],
  ['Какой тип у <code>x := 2.5</code>?',['float32','float64','decimal','double'],1,'Дробные литералы по умолчанию <code>float64</code>.'],
  ['Что напечатает <code>fmt.Println(7 / 2)</code>?',['3.5','3','4','ошибка'],1,'Оба операнда целые, деление целочисленное.'],
  ['Чему равно <code>int(-x)</code>, если <code>x := 3.99</code>?',['-4','-3','4','3'],1,'Преобразование отбрасывает дробную часть (к нулю).'],
  ['Какой код не скомпилируется?',['var a Celsius = 1; var b Celsius = 2; a + b','var c Celsius = 1; var f Fahrenheit = 2; c + f','type A = int; var x A = 1; var y int = x','var a int = 1; b := a + 2'],1,'Разные именованные типы нельзя смешивать без явного преобразования.'],
  ['Какой тип подходит для хранения суммы в копейках?',['float64','int64','string','complex128'],1,'Целое число без потери точности.']],
 task:{
  text:'<p>Прочитай одно целое число <code>n</code> типа <code>int64</code>. Выведи четыре строки: 1) <code>int8=</code> и значение <code>int8(n)</code> (с обёрткой при переполнении); 2) <code>uint8=</code> и значение <code>uint8(n)</code>; 3) <code>div=</code> целое частное <code>n/7</code>, пробел, <code>mod=</code> остаток <code>n%7</code>; 4) <code>float=</code> и <code>n/7</code> как дробное с двумя знаками после запятой.</p><p>Пример ввода: <code>300</code></p><p>Пример вывода:</p><pre>int8=44\nuint8=44\ndiv=42 mod=6\nfloat=42.86</pre>',
  starter:`package main

import "fmt"

func main() {
	var n int64
	fmt.Scan(&n)

	// TODO: выведи int8(n) и uint8(n)
	// TODO: выведи n/7 и n%7
	// TODO: выведи float64(n)/7 с двумя знаками
	fmt.Println(n)
}`,
  checks:[{in:'300\n',out:'int8=44\nuint8=44\ndiv=42 mod=6\nfloat=42.86'},{in:'-1\n',out:'int8=-1\nuint8=255\ndiv=0 mod=-1\nfloat=-0.14'},{in:'200\n',out:'int8=-56\nuint8=200\ndiv=28 mod=4\nfloat=28.57'},{in:'0\n',out:'int8=0\nuint8=0\ndiv=0 mod=0\nfloat=0.00'}],
  solution:`package main

import "fmt"

func main() {
	var n int64
	fmt.Scan(&n)
	fmt.Printf("int8=%d\\n", int8(n))
	fmt.Printf("uint8=%d\\n", uint8(n))
	fmt.Printf("div=%d mod=%d\\n", n/7, n%7)
	fmt.Printf("float=%.2f\\n", float64(n)/7)
}`,
  hint:'Приведение целых между размерами пишется <code>int8(n)</code>; для дробного деления сначала <code>float64(n)</code>, а потом делить на 7.'},
 l:[
  ['doc','Спецификация: числовые типы','https://go.dev/ref/spec#Numeric_types','en'],
  ['art','Go Blog: Constants','https://go.dev/blog/constants','en'],
  ['doc','Пакет math','https://pkg.go.dev/math','en'],
  ['art','Go by Example: Constants','https://gobyexample.com/constants','en']]},

});
fixTicks();
