(ns filetype.act
  (:require
   file html components
   [instaparse.core :as insta]
   [clojure.core.match :refer [match]]))

(defn parse-script [str]
  (parse str))

(defn include-in-script? [line]
  (and
   (not= :NEWLINE (first line))
   (not= :COMMENT (first line))))

(defn third [v]
  (nth v 2))

(defn fourth [v]
  (nth v 3))

(defn script-title [script]
  [(second (third (first script)))
   (rest script)])

(defn script-alias [alias]
  (let [name (second (fourth alias))
        as (second (second alias))]
    {:name name :as as}))

(defn script-aliases [script]
  (let [[aliases rst] (split-with #(= :ALIAS (first %)) script)
        aliases (map script-alias aliases)]
    [aliases rst]))

(defn lookup-author [alias aliases]
  (:name (first (filter #(= (:as %) alias) aliases))))

(defn just-one-message-string [msg]
  (= (type (first msg)) clojure.lang.Keyword))

(defn script-message [msg]
  (let [msg (if (just-one-message-string msg) [msg] msg)]
    (for [line msg]
      (match line
        [:STRING s] [:normal s]
        [:ITALIC [:STRING s]] [:italic s]))))

(defn script-body [script aliases]
  (for [line script]
    (match line
      [:LINE
       [:ALIAS_NAME author]
       [:COLON ": "]
       [:MESSAGE message]
       [:NEWLINE "\n"]] [:line (lookup-author author aliases) (script-message message)]
      [:SUBTEXT
       [:OPEN_PAREN "("]
       [:MESSAGE content]
       [:CLOSE_PAREN ")"]
       [:NEWLINE "\n"]] [:context (script-message content)])))

(defn ->ast [parsed]
  (let [script (filter include-in-script? parsed)
        [title script] (script-title script)
        [aliases script] (script-aliases script)
        body (script-body script aliases)]
    {:title title :aliases aliases :body body}))

(defn character-selector [script]
  [:div.script-control-menu
   [:p "You're acting as "
    [:select {:name "characters" :id "characterSelector"}
     (for [alias (:aliases script)]
       [:option.character {:value (:name alias)} (:name alias)])]
    " ."]])

(defn first-author?
  "Is the author provided the first author of the script?"
  [script author]
  (= author (:name (first (:aliases script)))))

(defn message-direction [script author]
  (if (first-author? script author)
    "right"
    "left"))

(defn >2-authors? [script]
  (> (count (:aliases script)) 2))

(defn render-message [msg]
  [:span
   (for [line msg]
     (match line
       [:normal s] [:span s]
       [:italic s] [:i s]))])

(defn render-line [author message script]
  [:blockquote {:class (str "message " author " " (message-direction script author))}
   (if (>2-authors? script) [:p.message-sender author] nil)
   [:div {:class (str "message-body " author " " (message-direction script author))}
    [:p.message-text (render-message message)]]])

(defn line->html [line script]
  (match line
    [:line author message] (render-line author message script)
    [:context content] [:p.context (render-message content)]))

(defn ->html
  "Convert the script to an HTML document."
  [script path file files file-list-idx]
  [:html
   (html/head path (:title script))
   [:body
    (components/component "sidebar" file files file-list-idx nil)
    [:div.site-body
     [:main
      [:div.act-container
       (html/css "/resources/filetype/act/act.css")
       (character-selector script)
       [:article.conversation
        (for [line (:body script)]
          (line->html line script))]
       (html/script "/resources/filetype/act/act.js")]]]]])

(defn contents
  "Get the file's contents as an AST"
  [file-obj files file-list-idx]
  (-> (:source-path file-obj)
      file/read
      parse-script
      ->ast
      (->html (:target-path file-obj) file-obj files file-list-idx)))

(defn ->string [file-obj]
  (html/->string (:contents file-obj)))

(defn ->disk [file-obj]
  (file/write (->string file-obj) (:target-path file-obj)))
